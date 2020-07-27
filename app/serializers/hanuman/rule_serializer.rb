module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    attributes :id, :question_id, :match_type, :type, :value, :script
    has_many :conditions
  end
end
