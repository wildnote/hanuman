module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    include ::PgSearch
    has_paper_trail

    # PG Search
    pg_search_scope :search,
      associated_against: {
        answer_choice: [:option_text]
      },
      using: { tsearch: { dictionary: 'english'} }

    # Relations
    belongs_to :observation, touch: true
    belongs_to :answer_choice
    belongs_to :multiselectable, polymorphic: true

    def answer_choice_text
      answer_choice.option_text
    end
  end
end
