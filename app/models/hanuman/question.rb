module Hanuman
  class Question < ActiveRecord::Base
    acts_as_taggable
    has_paper_trail
    has_ancestry

    attr_accessor :single_cloning

    # Relations
    belongs_to :answer_type
    belongs_to :survey_template
    has_many :answer_choices, -> { order :sort_order, :option_text }, dependent: :destroy, inverse_of: :question
    # if a user deletes a question from survey admin we need to delete related observations, giving warning in survey admin
    has_many :observations, dependent: :destroy #**** controlling the delete through a confirm on the ember side of things-kdh *****
    has_many :rules, dependent: :destroy
    has_many :conditions, dependent: :destroy # The conditions this question is dependent of
    has_many :rule_conditions, through: :rules, source: :conditions

    # Validations
    validates :answer_type_id, presence: true
    # wait until after migration for these validations
    validates :question_text, presence: true, unless: :question_text_not_required

    # Callbacks
    after_create :process_question_changes_on_observations, if: :survey_template_not_fully_editable?
    after_update :process_question_changes_on_observations, if: :survey_template_not_fully_editable_or_sort_order_changed?

    amoeba do
      include_association :rules
      include_association :answer_choices
      include_association :conditions, if: :survey_cloning?

      # set duplicated_question_id so I can remap the ancestry relationships on a survey template duplicate-kdh
      customize(lambda { |original_question,new_question|
        new_question.duped_question_id = original_question.id
      })
    end

    def self.sort(sort_column, sort_direction)
      joins(:answer_type).order(("#{sort_column}  #{sort_direction}")
        .gsub('asc asc', 'asc')
        .gsub('asc desc', 'asc')
        .gsub('desc desc', 'desc')
        .gsub('desc asc', 'desc'))
    end

    def question_text_not_required
      return false if answer_type.blank?
      return answer_type.name == 'line'
    end

    # adding this method so I can check it before calling the job to process question changes on observations to try and decrease the number of 404 errors coming through
    def survey_template_not_fully_editable?
      !survey_template.try(:fully_editable)
    end

    # adding this method so I can check it before calling the job to process question changes on observations to try and decrease the number of 404 errors coming through
    def survey_template_not_fully_editable_or_sort_order_changed?
      survey_template_not_fully_editable? && sort_order_changed?
    end

      # need to process question changes on observation in job because the changes could cause timeout on survey template with a bunch of questions
    def process_question_changes_on_observations
      ProcessQuestionChangesWorker.perform_async(id)
    end

    # if survey has data submitted against it, then submit blank data for each
    # survey for newly added question, then re-save survey so that group_sort gets reset
    def submit_blank_observation_data
      question = self
      parent = question.parent
      survey_template = question.survey_template
      surveys = survey_template.surveys
      surveys.each do |s|
        if parent.blank?
          Observation.create_with(
            answer: ''
          ).find_or_create_by(
            survey_id: s.id,
            question_id: question.id,
            entry: 1
          )
        # if new question is in a repeater must add observation for each instance of repeater saved in previous surveys
        else
          s.observations.where(question_id: parent.id).each do |o|
            Hanuman::Observation.create_with(
              answer: ''
            ).find_or_create_by(
              survey_id: s.id,
              question_id: question.id,
              entry: o.entry,
              parent_repeater_id: o.repeater_id
            )
          end
        end

        s.update_column(:observations_sorted, false)
        s.update_column(:observation_visibility_set, false)
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
      unless self.rules.blank?
        ActiveModel::ArraySerializer.new(self.rules, each_serializer: Hanuman::RuleHashSerializer).to_json
      end
    end

    def survey_cloning?
      !!!single_cloning
    end

    # duplicate and save a single question with answer choices and conditions
    def dup_and_save
      self.single_cloning = true
      new_q = self.amoeba_dup
      new_q.sort_order = self.sort_order.to_i
      new_q.save
      # Associate the conditions from the rule
      self.rules.each do |rule|
        rule.conditions.each do |condition|
          new_condition = condition.amoeba_dup
          new_condition.rule = new_q.rules.find_by(duped_rule_id: rule.id)
          new_condition.save
        end
      end
      new_q
    end

    def dup_section
      section_q = self
      descendants_qs = section_q.descendants.order(:sort_order)
      start_sort_order = 100000
      increment_sort_by = 2
      unless descendants_qs.blank?
        start_sort_order = descendants_qs.last.sort_order
        # number of new descendants questions + condition (parent) and descendants (rule) questions
        increment_sort_by = descendants_qs.count + 1
      else
        start_sort_order = section_q.sort_order
      end

      # remap sort orders leaving space for new questions before saving new question
      section_q.survey_template.questions.where("sort_order > ?", start_sort_order).each do |q|
        q.paper_trail.without_versioning do
          q.update_attribute('sort_order', q.sort_order + increment_sort_by)
        end
      end

      # this will duplicate the question, will need to create a new rule,
      # and then set the condtions to new rule id
      new_section_q = section_q.amoeba_dup
      new_section_q.sort_order = new_section_q.sort_order + increment_sort_by
      new_section_q.save
      descendants_qs.each do |q|
        new_child_q = q.dup_and_save

        # Update ancestry relationship dynamically
        new_child_q.parent = new_section_q.descendants.find_by(duped_question_id: q.parent.id) || new_section_q

        # set sort_order
        new_child_q.sort_order = new_child_q.sort_order + increment_sort_by
        new_child_q.save
      end

      # Re-organize / map conditions
      new_section_q.descendants.order(:sort_order).each do |question|
        next if question.rule_conditions.empty?
        question.rule_conditions.each do |condition|
          next unless descendants_qs.include?(condition.question)
          condition.question_id = new_section_q.descendants.find_by(duped_question_id: condition.question.id).id
          condition.save
        end
      end

      # Associate the conditions from the rule
      self.rules.each do |rule|
        rule.conditions.each do |condition|
          new_condition = condition.amoeba_dup
          new_condition.rule = new_section_q.rules.find_by(duped_rule_id: rule.id)
          new_condition.save
        end
      end

      new_section_q
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


    def set_db_column_name
      if self.db_column_name.blank?
        shorthand = self.question_text.strip.parameterize.underscore.gsub(/\s|:|\//, '-').truncate(16, omission: "") + "_"
        counter = 0

        taken = true
        while taken do
          self.survey_template.questions.each do |q|
            begin
              raise if q.db_column_name == shorthand + counter.to_s
            rescue
              counter += 1
              retry
            end
          end
          taken = false
        end
        self.update_column(:db_column_name, shorthand + counter.to_s)
      end
    end
  end

end
