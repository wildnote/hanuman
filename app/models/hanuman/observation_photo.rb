module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    mount_uploader :photo, PhotoUploader
  end
end
