module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    default_scope  includes(:survey_question).order('hanuman_observations.created_at ASC, hanuman_survey_questions.sort_order asc')
  end
end
