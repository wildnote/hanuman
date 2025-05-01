module Hanuman
  class ConditionSerializer < ActiveModel::Serializer
    attributes :id, :operator, :answer, :question_id

    def json_key
      'condition'
    end
  end
end
