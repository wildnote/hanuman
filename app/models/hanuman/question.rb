module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    belongs_to :answer_type
    has_many :survey_questions
    has_many :answer_choices
    
    def typeahead_answer_choices_list_string
      list = []
      self.answer_choices.all_sorted.each do |a|
        list << a.formatted_answer_choice
      end
      list.join("||")
    end
  end
end
