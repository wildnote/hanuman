module Hanuman
  class SurveyQuestion < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey_step
    belongs_to :question
    has_many :observations

    def self.by_step(step)
      where(step: step)
    end

    def answer_type
      self.question.answer_type.name
    end
  end
end
