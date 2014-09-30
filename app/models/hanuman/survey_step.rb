module Hanuman
  class SurveyStep < ActiveRecord::Base
    belongs_to :survey_template
    has_many :survey_questions
    has_many :questions, :through => :survey_questions
  end
end
