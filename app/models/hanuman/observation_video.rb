module Hanuman
  class ObservationVideo < ActiveRecord::Base
    has_paper_trail
    mount_uploader :video, VideoUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }
    has_one    :survey, through: :observation
  end
end
