module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    def json_key
      'rule'
    end
    attributes :id, :question_id, :match_type, :type, :value, :script
    has_many :conditions
  end
end
