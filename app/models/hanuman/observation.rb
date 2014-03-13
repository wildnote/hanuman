module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question
    default_scope  includes(:survey_question).order('hanuman_survey_questions.order asc')
  end
end
