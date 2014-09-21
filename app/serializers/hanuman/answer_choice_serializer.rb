module Hanuman
  class AnswerChoiceSerializer < ActiveModel::Serializer
    attributes :id, :option_text, :scientific_text
  end
end