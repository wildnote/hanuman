module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    attributes :id, :question_id, :match_type
    has_many :conditions, through: :rule_conditions
  end
end
