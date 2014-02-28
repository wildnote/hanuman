module Hanuman
  class Question < ActiveRecord::Base
    belongs_to :answer_type
  end
end
