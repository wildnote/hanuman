module Hanuman
  class AnswerTypeSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :description, :descriptive_name, :answer_choice_type,
               :has_answer_choices, :post_name, :post_type, :element_type, :has_an_answer
  end
end
