module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail
    belongs_to :observation
    belongs_to :answer_choice
  
    def answer_choice_text
      self.answer_choice.option_text
    end
  end
end
