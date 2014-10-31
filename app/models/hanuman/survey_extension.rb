module Hanuman
  class SurveyExtension < ActiveRecord::Base
    belongs_to :survey
    validates_presence_of :survey_id
  end
end
