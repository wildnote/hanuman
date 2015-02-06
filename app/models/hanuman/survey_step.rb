module Hanuman
  class SurveyStep < ActiveRecord::Base
    belongs_to :survey_template
    has_many :questions, -> { order :sort_order }
    
    validates_presence_of :survey_template_id, :step
    validates_uniqueness_of :step, scope: :survey_template_id
    
    def self.by_step(step)
      where(step: step)
    end
  end
end
