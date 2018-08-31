module Hanuman
  class VisbilityRuleSerializer < ActiveModel::Serializer
    attributes :id, :match_type
    has_many :conditions
  end
end
