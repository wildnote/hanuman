module Hanuman
  class SurveyQuestion < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :question

    # this should be refactored as a decorator
    def question_label
      group + ' | ' + order + ' | ' + question.question_text
    end
  end
end
