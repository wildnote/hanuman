module Hanuman
  class SurveyStep < ActiveRecord::Base
    belongs_to :survey_template
    has_many :questions, -> { order :sort_order }
    
    def self.by_step(step)
      where(step: step)
    end
  end
end
