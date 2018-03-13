module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    has_ancestry

    # Relations
    belongs_to :answer_type
    belongs_to :survey_template
    has_many :answer_choices, -> { order :sort_order, :option_text }, dependent: :destroy, inverse_of: :question
    # if a user deletes a question from survey admin we need to delete related observations, giving warning in survey admin
    has_many :observations, dependent: :destroy #**** controlling the delete through a confirm on the ember side of things-kdh *****
    has_one :rule, dependent: :destroy
    has_many :conditions, dependent: :destroy

    # Validations
    validates :answer_type_id, presence: true
    # wait until after migration for these validations
    validates :question_text, presence: true, unless: :question_text_not_required

    # Callbacks
    after_create :process_question_changes_on_observations, if: :survey_template_not_fully_editable?
    after_update :process_question_changes_on_observations, if: :survey_template_not_fully_editable_or_sort_order_changed?

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

    def question_text_not_required
      return false if answer_type.blank?
      return answer_type.name == 'line'
    end

    # adding this method so I can check it before calling the job to process question changes on observations to try and decrease the number of 404 errors coming through
    def survey_template_not_fully_editable?
      !self.survey_template.fully_editable
    end

    # adding this method so I can check it before calling the job to process question changes on observations to try and decrease the number of 404 errors coming through
    def survey_template_not_fully_editable_or_sort_order_changed?
      if survey_template_not_fully_editable? && sort_order_changed?
        true
      end
    end

    # need to process question changes on observation in job because the changes could cause timeout on survey template with a bunch of questions
    def process_question_changes_on_observations
      ProcessQuestionChangesWorker.perform_async(self.id)
    end

    # if survey has data submitted against it, then submit blank data for each
    # survey for newly added question, then re-save survey so that group_sort gets reset
    def submit_blank_observation_data
      question = self
      parent = self.parent
      survey_template = self.survey_template
      surveys = survey_template.surveys
      surveys.each do |s|
        if parent.blank?
          Observation.create_with(
            answer: ''
          ).find_or_create_by(
            survey_id: s.id,
            question_id: self.id,
            entry: 1
          )
        # if new question is in a repeater must add observation for each instance of repeater saved in previous surveys
        else
          s.observations.where(question_id: parent.id).each do |o|
            Observation.create_with(
              answer: ''
            ).find_or_create_by(
              survey_id: s.id,
              question_id: self.id,
              entry: o.entry
            )
          end
        end
        # calling save so that before_save method apply_group_sort is called to resort observations after inserting new ones for new questions-kdh
        s.save
      end
    end

    # def resort_submitted_observations
    #   unless survey_template.fully_editable
    #     surveys = survey_template.surveys
    #     surveys.each do |s|
    #       s.save
    #     end
    #   end
    # end

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
