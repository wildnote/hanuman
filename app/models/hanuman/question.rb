module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    has_ancestry
    belongs_to :answer_type
    belongs_to :survey_step
    has_many :answer_choices, dependent: :destroy, inverse_of: :question
    has_many :observations, dependent: :destroy #**** controlling the delete through a confirm on the ember side of things-kdh *****
    has_one :rule, dependent: :destroy
    has_many :conditions#, dependent: :destroy

    validates_presence_of :answer_type_id
    # wait until after migration for these validations
    #validates_presence_of :sort_order, :survey_step_id

    validates :question_text, presence: true, unless: :question_text_not_required

    after_create :submit_blank_observation_data

    amoeba do
      include_association [:rule, :conditions, :answer_choices]
      # set duplicated_question_id so I can remap the ancestry relationships on a survey template duplicate-kdh
      customize(lambda { |original_question,new_question|
        new_question.duped_question_id = original_question.id
      })
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
      unless survey_step.survey_template.fully_editable
        surveys = survey_step.survey_template.surveys
        surveys.each do |s|
          Observation.create(
            survey_id: s.id,
            question_id: self.id,
            answer: ''
          )
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

    def dup_and_save
      new_q = self.amoeba_dup
      new_q.sort_order = self.sort_order + 1
      new_q.save
    end
    
  end
end
