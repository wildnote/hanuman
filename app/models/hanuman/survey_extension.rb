module Hanuman
  class SurveyExtension < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :survey, optional: true

  end
end
