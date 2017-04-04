module Hanuman
  class ObservationDocument < ActiveRecord::Base
    include ::PgSearch
    mount_uploader :document, DocumentUploader

    # PG Search
    pg_search_scope :search,
      against: :description,
      using: { tsearch: { dictionary: 'english'} }

    # Relations
    belongs_to :observation
  end
end
