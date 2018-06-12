module Hanuman
  class ObservationSignature < ActiveRecord::Base
    has_paper_trail
    mount_uploader :signature, SignatureUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }
    has_one    :survey, through: :observation
  end
end
