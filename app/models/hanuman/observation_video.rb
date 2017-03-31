module Hanuman
  class ObservationVideo < ActiveRecord::Base
    has_paper_trail
    mount_uploader :video, VideoUploader
    belongs_to :observation
  end
end
