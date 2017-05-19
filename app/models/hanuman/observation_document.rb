module Hanuman
  class ObservationDocument < ActiveRecord::Base
    include ::PgSearch
    has_paper_trail
    mount_uploader :document, DocumentUploader

    # PG Search
    pg_search_scope :search,
      against: :description,
      using: { tsearch: { dictionary: 'english'} }

    # Relations
    belongs_to :observation, -> { unscope(:includes, :order) }
    has_one    :survey, through: :observation
  end
end
