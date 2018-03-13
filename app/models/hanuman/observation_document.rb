module Hanuman
  class ObservationDocument < ActiveRecord::Base
    has_paper_trail
    mount_uploader :document, DocumentUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }
    has_one    :survey, through: :observation
  end
end
