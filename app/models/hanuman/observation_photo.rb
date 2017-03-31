module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    has_paper_trail
    mount_uploader :photo, PhotoUploader
    belongs_to :observation
  end
end
