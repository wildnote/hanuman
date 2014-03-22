module Hanuman
  class SurveyQuestion < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :question
    has_many :observations

    def self.by_step(step)
      where(group: step)
    end
  end
end
