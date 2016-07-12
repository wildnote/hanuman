module Hanuman
  class ObservationVideo < ActiveRecord::Base
    mount_uploader :video, VideoUploader
    belongs_to :observation
  end
end
