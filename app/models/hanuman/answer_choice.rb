module Hanuman
  class AnswerChoice < ActiveRecord::Base
    has_ancestry
    belongs_to :question
  end
end
