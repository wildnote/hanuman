module Hanuman
  class ObservationPhoto < ActiveRecord::Base
    include ::PgSearch
    has_paper_trail
    mount_uploader :photo, PhotoUploader

    # PG Search
    pg_search_scope :search,
      against: :description,
      using: { tsearch: { dictionary: 'english'} }

    # Relations
    belongs_to :observation
  end
end
