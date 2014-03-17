module Hanuman
  class ObservationAnswer < ActiveRecord::Base
    belongs_to :observation
    belongs_to :answer_choice
  end
end
