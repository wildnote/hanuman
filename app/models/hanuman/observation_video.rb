module Hanuman
  class ObservationVideo < ActiveRecord::Base
    has_paper_trail
    mount_uploader :video, VideoUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }, optional: true
    has_one    :survey, through: :observation

    after_commit :set_media_access_mode_to_authenticated, on: :create
    def set_media_access_mode_to_authenticated
      SetMediaAccessModeWorker.perform_async(self.id, 'video')
    end
  end
end
