module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    default_scope  includes(:survey_question).order('hanuman_survey_questions.order asc')
  end
end
