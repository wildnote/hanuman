module Hanuman
  class Question < ActiveRecord::Base
    belongs_to :answer_type
    has_many :survey_questions
    has_many :answer_choices
  end
end
