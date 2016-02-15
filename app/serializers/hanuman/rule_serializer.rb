module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    attributes :id, :question_id, :match_type, :hidden
    has_many :conditions#, through: :rule_conditions
    def hidden
      object.question.hidden
    end
  end
end
