module Hanuman
  class ConditionSerializer < ActiveModel::Serializer
    def json_key
      'condition'
    end
    attributes :id, :operator, :answer, :question_iddef json_key
      'survey_template'
    end
  end
end
