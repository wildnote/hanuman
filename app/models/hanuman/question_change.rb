module Hanuman
  class QuestionChange < ActiveRecord::Base
    has_paper_trail

    belongs_to :question
    belongs_to :survey_template

  end
end