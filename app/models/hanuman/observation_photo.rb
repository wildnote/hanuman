module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    has_paper_trail
    mount_uploader :photo, PhotoUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }
    has_one    :survey, through: :observation
  end
end
