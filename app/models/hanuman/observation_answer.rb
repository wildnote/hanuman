module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail
    belongs_to :observation
    belongs_to :answer_choice
    
    validates_presence_of :answer_choice_id
  
    def answer_choice_text
      self.answer_choice.option_text
    end
  end
end
