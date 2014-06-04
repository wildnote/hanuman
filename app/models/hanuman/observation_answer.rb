module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    has_paper_trail
    belongs_to :observation
    belongs_to :answer_choice
  end
end
