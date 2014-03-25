module Hanuman
  class AnswerChoice < ActiveRecord::Base
    has_ancestry
    belongs_to :question

    def option_text_plus_scientific_text
      option_text + ' [' + scientific_text + ']'
    end
  end
end
