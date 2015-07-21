module Hanuman
  class AnswerTypeSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :description, :descriptive_name,
               :has_answer_choices, :external_data_source
  end
end
