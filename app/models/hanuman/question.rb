module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    belongs_to :answer_type
    belongs_to :survey_step
    #has_many :survey_questions
    has_many :answer_choices, dependent: :destroy, inverse_of: :question
    has_many :observations, dependent: :destroy
    
    validates_presence_of :answer_type
    # wait until after migration for these validations
    #validates_presence_of :sort_order, :survey_step_id
    
    validates :question_text, presence: true, unless: :no_text_on_that_answer_type
    
    after_create :submit_blank_observation_data

    amoeba do
      include_association :answer_choices
    end
    
    def no_text_on_that_answer_type
      unless answer_type.blank?
        answer_type.name.eql? "line"
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
  end
end
