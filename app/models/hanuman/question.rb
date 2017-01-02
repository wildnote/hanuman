module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    has_ancestry

    # Relations
    belongs_to :answer_type
    belongs_to :survey_step # Deprecated
    belongs_to :survey_template
    has_many :answer_choices, dependent: :destroy, inverse_of: :question
    has_many :observations, dependent: :destroy #**** controlling the delete through a confirm on the ember side of things-kdh *****
    has_one :rule, dependent: :destroy
    has_many :conditions, dependent: :destroy

    # Validations
    validates :answer_type_id, presence: true
    # wait until after migration for these validations
    #validates_presence_of :sort_order, :survey_step_id
    validates :question_text, presence: true, unless: :question_text_not_required

    # Callbacks
    # commenting this out because we are not going to update previously submitted data at this point, leave it alone
    # after_create :submit_blank_observation_data
    # this flooding the system on a question resort which is resulting in a db deadlock,
    # will manually call this at the survey template level after all changes are made
    #after_update :resort_submitted_observations, if: :sort_order_changed?

    # need to save array of child_ids to pass to native API it's too slow to generate on the fly
    # if question has ancestors, loop through those ancestors and update the ancestry_children field
    after_save :set_ancestry_children
    after_destroy :set_ancestry_children
    before_create :set_ancestry_sort_order

    amoeba do
      include_association [:rule, :conditions, :answer_choices]
      # set duplicated_question_id so I can remap the ancestry relationships on a survey template duplicate-kdh
      customize(lambda { |original_question,new_question|
        new_question.duped_question_id = original_question.id
      })
    end

    def self.sort(sort_column, sort_direction)
      joins(:answer_type).order((sort_column + " " + sort_direction).gsub("asc asc", "asc").gsub("asc desc", "asc").gsub("desc desc", "desc").gsub("desc asc", "desc"))
    end

    def set_ancestry_children
      self.ancestors.each do |a|
        a.ancestry_children = a.child_ids
        a.save
      end
    end

    def set_ancestry_sort_order
      if parent && parent.children.last
        self.sort_order = parent.children.last.sort_order
      end
    end

    def question_text_not_required
      unless answer_type.blank?
        case answer_type.name
        when "line"
          true
        else
          false
        end
      end
    end

    # if survey has data submitted against it, then submit blank data for each
    # survey for newly added question
    def submit_blank_observation_data
      question = self
      parent = self.parent
      unless survey_template.fully_editable
        surveys = survey_template.surveys
        surveys.each do |s|
          if parent.blank?
            Observation.create(
              survey_id: s.id,
              question_id: self.id,
              answer: '',
              entry: 1
            )
          # if new question is in a repeater must add observation for each instance of repeater saved in previous surveys
          else
            s.observations.where(question_id: parent.id).each do |o|
              Observation.create(
                survey_id: s.id,
                question_id: self.id,
                answer: '',
                entry: o.entry
              )
            end
          end
          # calling save so that before_save method apply_group_sort is called to resort observations after inserting new ones for new questions-kdh
          s.save
        end
      end
    end

    def resort_submitted_observations
      unless survey_template.fully_editable
        surveys = survey_template.surveys
        surveys.each do |s|
          s.save
        end
      end
    end

    # build the rule_hash to pass into rails to then be used by javascript for hide/show functions
    def rule_hash
      # "rule": {
      #         "id": "1",
      #         "question_id": "822",
      #         "match_type": "all",
      #         "conditions": [
      #           {
      #             "id": "1",
      #             "question_id": "818",
      #             "operator": "is equal to",
      #             "answer": "Yes"
      #           }
      #         ]
      #       }
      unless self.rule.blank?
        Hanuman::RuleHashSerializer.new(self.rule).to_json
      end
    end

    # duplicate and save a single question with answer choices and conditions
    def dup_and_save
      new_q = self.amoeba_dup
      new_q.sort_order = self.sort_order + 1
      new_q.save
    end

    # duplicate a question set which contains a parent question, followed by a
    # single question or a section of questions that is triggered by conditional logic
    # this method duplicates the parent question, the section/child question
    # and all conditional logic and ancestry relationships are mimicked for a
    # complete duplication process-kdh
    def dup_question_set_and_save
      parent_q = self
      section_q = parent_q.conditions.first.rule.question
      children_qs = section_q.children
      start_sort_order = 10000
      increment_sort_by = 2
      unless children_qs.blank?
        start_sort_order = children_qs.last.sort_order
        # number of new children questions + condition (parent) and children (rule) questions
        increment_sort_by = children_qs.count + 2
      else
        start_sort_order = section_q.sort_order
      end

      # remap sort orders leaving space for new questions before saving new question
      parent_q.survey_template.questions.where("sort_order > ?", start_sort_order).each do |q|
        q.sort_order = q.sort_order + increment_sort_by
        q.save
      end

      # this will create new question, answer choices and conditions,
      # but the conditions will be pointed to the old rule which we will need to remap
      new_parent_q = parent_q.amoeba_dup
      # now that we have resorted save new_parent_q into open slot
      new_parent_q.sort_order = new_parent_q.sort_order + increment_sort_by
      new_parent_q.save

      # this will duplicate the question, will need to create a new rule,
      # and then set the condtions to new rule id
      new_section_q = section_q.amoeba_dup
      new_section_q.sort_order = new_section_q.sort_order + increment_sort_by
      new_section_q.save

      # update newly created conditions with rule relationship now that the rule has been created
      # the rule gets created with the section question
      new_rule = new_section_q.rule
      new_parent_q.conditions.each do |c|
        c.rule_id = new_rule.id
        c.save
      end

      children_qs.each do |q|
        new_child_q = q.amoeba_dup
        # update ancestry relationship
        new_child_q.parent = new_section_q

        # set sort_order
        new_child_q.sort_order = new_child_q.sort_order + increment_sort_by
        new_child_q.save
      end
    end

    def dup_section
      section_q = self
      children_qs = section_q.children
      start_sort_order = 10000
      increment_sort_by = 2
      unless children_qs.blank?
        start_sort_order = children_qs.last.sort_order
        # number of new children questions + condition (parent) and children (rule) questions
        increment_sort_by = children_qs.count + 2
      else
        start_sort_order = section_q.sort_order
      end

      # remap sort orders leaving space for new questions before saving new question
      section_q.survey_template.questions.where("sort_order > ?", start_sort_order).each do |q|
        q.sort_order = q.sort_order + increment_sort_by
        q.save
      end

      # this will duplicate the question, will need to create a new rule,
      # and then set the condtions to new rule id
      new_section_q = section_q.amoeba_dup
      new_section_q.sort_order = new_section_q.sort_order + increment_sort_by
      new_section_q.save

      children_qs.each do |q|
        new_child_q = q.amoeba_dup
        # update ancestry relationship
        new_child_q.parent = new_section_q

        # set sort_order
        new_child_q.sort_order = new_child_q.sort_order + increment_sort_by
        new_child_q.save
      end

      # update newly created conditions with rule relationship now that the rule has been created
      # the rule gets created with the section question
      # new_children_questions = new_section_q.children
      # new_children_questions.each do |q|
      #   new_rule = q.rule
      #   unless q.rule.blank?
      #     new_parent_q.conditions.each do |c|
      #       c.rule_id = new_rule.id
      #       c.save
      #     end
      #   end
      # end

    end

    def import_answer_choices(file_name, file_path)
      spreadsheet = Import::open_spreadsheet(file_name, file_path)
      header = spreadsheet.row(1)
      imported = []
      not_imported = []
      message = nil
      if header.index("Answer Choices").blank?
        message = "Could not import answer choices because we found no 'Answer Choices' column."
      else
        (2..spreadsheet.last_row).each do |i|
          row = Hash[[header, spreadsheet.row(i)].transpose]
          name = row["Answer Choices"]
          answer_choice = AnswerChoice.where(option_text: name, question_id: self.id)
          if answer_choice.blank?
            imported << name
            AnswerChoice.create(option_text: name, question_id: self.id)
          else
            not_imported << name
          end
        end
        puts "********"
        puts "********"
        puts "********"
        puts "imported"
        puts imported
        puts "********"
        puts "********"
        puts "********"
        puts "not imported"
        puts not_imported
        puts "********"
        puts "********"
        puts "********"
        message = "number of answer choices imported: #{imported.count.to_s}; number of answer choices not imported because they are already attached to the question: #{not_imported.count.to_s}."
      end
      message
    end
  end
end
