module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to  :observation, -> { unscope(:includes, :order) }#, touch: true
    has_one     :survey, through: :observation
    belongs_to  :answer_choice
    belongs_to  :multiselectable, polymorphic: true

    def answer_choice_text
      answer_choice.option_text
    end
  end
end
