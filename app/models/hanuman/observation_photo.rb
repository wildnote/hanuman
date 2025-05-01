module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    has_paper_trail
    mount_uploader :photo, PhotoUploader

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }, optional: true
    has_one    :survey, through: :observation

    after_commit :set_media_access_mode_to_authenticated, on: :create

    def set_media_access_mode_to_authenticated
      SetMediaAccessModeWorker.perform_async(self.id, 'photo')
    end

    def rotation_handle_nil
      rotation.blank? ? 0 : rotation
    end

  end
end
