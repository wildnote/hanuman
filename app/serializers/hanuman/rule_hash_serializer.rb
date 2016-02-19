# serializer for the rule_hash method that returns rules to dom in web application-kdh
module Hanuman
  class RuleHashSerializer < ActiveModel::Serializer
    attributes :id, :question_id, :match_type, :hidden
    has_many :conditions
    def hidden
      object.question.hidden
    end
  end
end
