module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :observation, touch: true
    belongs_to :answer_choice
    belongs_to :multiselectable, polymorphic: true

    def answer_choice_text
      answer_choice.option_text
    end
  end
end
