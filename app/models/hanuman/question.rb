module Hanuman
  class Question < ActiveRecord::Base
    has_paper_trail
    belongs_to :answer_type
    has_many :survey_questions
    has_many :answer_choices
  end
end
