module Hanuman
  class AnswerTypeSerializer < ActiveModel::Serializer
    attributes :id, :name, :status
  end
end