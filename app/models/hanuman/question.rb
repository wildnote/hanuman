module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    belongs_to :answer_type
    belongs_to :survey_step
    #has_many :survey_questions
    has_many :answer_choices
    has_many :observations
    
    validates_associated :answer_type
    validates_associated :survey_step
  end
end
