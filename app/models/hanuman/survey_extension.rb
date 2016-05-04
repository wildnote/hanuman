module Hanuman
  class SurveyExtension < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey
  end
end
