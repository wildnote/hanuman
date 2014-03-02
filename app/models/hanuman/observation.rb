module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question

    # had to add question attributes to observation attr_accessor so that I could set that in build of controller
    attr_accessor :question_text, :answer_type, :order, :duplicator, :group

  end
end
