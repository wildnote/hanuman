module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    def json_key
      'rule'
    end
    attributes :id, :question_id, :match_type, :type, :value, :script, :conditions

    # Override to ensure conditions are included
    def conditions
      object.conditions.map do |condition|
        {
          id: condition.id,
          operator: condition.operator,
          answer: condition.answer,
          question_id: condition.question_id,
          rule_id: condition.rule_id
        }
      end
    end
  end
end
