module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail
    has_many :survey_questions, -> { order :sort_order }
    has_many :questions, through: :survey_questions

    def steps
      self.survey_questions.collect(&:step).uniq
    end
  end

end
