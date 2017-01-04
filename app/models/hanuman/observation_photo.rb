module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    mount_uploader :photo, PhotoUploader
    belongs_to :observation
  end
end
