module Hanuman
  class SurveyExtension < ApplicationRecord
    has_paper_trail

    # Relations
    belongs_to :survey

  end
end
