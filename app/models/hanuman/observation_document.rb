module Hanuman
  class ObservationDocument < ActiveRecord::Base
    has_paper_trail
    mount_uploader :document, DocumentUploader
    belongs_to :observation
  end
end
