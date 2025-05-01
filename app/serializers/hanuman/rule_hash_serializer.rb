# serializer for the rule_hash method that returns rules to dom in web application-kdh
module Hanuman
  class RuleHashSerializer < ActiveModel::Serializer
    def json_key
      'rule_hash'
    end
    attributes :id, :question_id, :match_type, :hidden, :type, :value, :script
    has_many :conditions
    def hidden
      object.question.hidden
    end
  end
end
