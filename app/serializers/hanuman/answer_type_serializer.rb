module Hanuman
  class AnswerTypeSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :description, :descriptive_name,
               :has_answer_choices, :post_name, :post_type, :element_type
  end
end
