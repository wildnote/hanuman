module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail
    has_many :survey_questions, -> { order :sort_order }
    has_many :questions, through: :survey_questions

    def self.all_sorted
      order("name ASC")
    end

    def self.all_active_sorted
      where("status = 'active'").order("name ASC")
    end

    def steps
      self.survey_questions.collect(&:step).uniq
    end
    
    def survey_step_is_duplicator?(step)
      self.survey_questions.by_step(step).first.duplicator
    end
  end
end
