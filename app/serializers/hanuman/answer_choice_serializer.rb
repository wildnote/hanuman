module Hanuman
  class AnswerChoiceSerializer < ActiveModel::Serializer
    attributes :id, :option_text, :scientific_text, :question_id
  end
end