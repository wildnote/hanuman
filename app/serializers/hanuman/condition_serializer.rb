module Hanuman
  class ConditionSerializer < ActiveModel::Serializer
    attributes :id, :question_id, :operator, :answer
  end
end
