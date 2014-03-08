module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question
  end
end
