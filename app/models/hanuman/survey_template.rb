module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail
    has_many :survey_steps, -> { order :step }
    has_many :questions, through: :survey_steps
    has_many :surveys
    
    # this method is only needed for architecture migration
    has_many :survey_questions, -> { order :sort_order }
    has_many :questions, through: :survey_questions
    
    validates_presence_of :name

    def self.all_sorted
      order("name ASC")
    end

    def self.all_active_sorted
      where("status = 'active'").order("name ASC")
    end

    # this method is only needed for architecture migration
    def steps
      self.survey_questions.collect(&:step).uniq
    end
    
    def survey_step_is_duplicator?(step)
      self.survey_steps.by_step(step).first.duplicator
    end
    
    def num_reports_submitted
      self.surveys.count
    end
    
    # a survey template
    def fully_editable
      num_reports_submitted < 1 ? true : false
    end
  end
end
