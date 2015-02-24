module Hanuman
  class SurveyStep < ActiveRecord::Base
    belongs_to :survey_template#, inverse_of: :survey_steps
    has_many :questions, -> { order :sort_order }
    
    validates_presence_of :survey_template, :step
    validates_uniqueness_of :step, scope: :survey_template_id
    
    amoeba do
      enable
    end
    
    def self.by_step(step)
      where(step: step)
    end
  end
end
