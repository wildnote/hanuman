module Hanuman
  class AnswerTypeSerializer < ActiveModel::Serializer
    def json_key
      'answer_type'
    end
    attributes :id, :name, :status, :description, :descriptive_name, :answer_choice_type,
               :has_answer_choices, :post_name, :post_type, :element_type, :has_an_answer,
               :group_type
  end
end
