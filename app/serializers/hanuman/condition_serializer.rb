module Hanuman
  class ConditionSerializer < ActiveModel::Serializer
    attributes :id, :operator, :answer, :question_id
  end
end
