module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    belongs_to :answer_type
    belongs_to :survey_step
    #has_many :survey_questions
    has_many :answer_choices
    has_many :observations
    
    validates_presence_of :answer_type_id
    # wait until after migration for these validations
    #validates_presence_of :sort_order, :survey_step_id
    
    validates :question_text, presence: true, unless: :no_text_on_that_answer_type
    
    def no_text_on_that_answer_type
      answer_type.name.eql? "line"
    end
  end
end
