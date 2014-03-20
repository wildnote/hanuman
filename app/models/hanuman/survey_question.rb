module Hanuman
  class SurveyQuestion < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :question
    has_many :observations
  end
end
