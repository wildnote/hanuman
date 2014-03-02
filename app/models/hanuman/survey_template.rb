module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    belongs_to :organization
    has_many :survey_questions, order: :order
    has_many :questions, through: :survey_questions
  end
end
