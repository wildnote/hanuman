module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to  :observation, -> { unscope(:includes, :order) }, optional: true #, touch: true
    has_one     :survey, through: :observation
    belongs_to  :answer_choice, optional: true
    belongs_to  :multiselectable, polymorphic: true, optional: true

    amoeba do
      nullify :uuid
      nullify :observation_uuid
    end

    def answer_choice_text
      if answer_choice.present?
        answer_choice.option_text
      elsif multiselectable.present?
        multiselectable.formatted_answer_choice
      end
    end
  end
end
