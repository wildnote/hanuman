module Hanuman
  class ObservationDocument < ActiveRecord::Base
    mount_uploader :document, DocumentUploader
    belongs_to :observation
  end
end
