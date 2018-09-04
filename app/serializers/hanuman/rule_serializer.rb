module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    attributes :id, :match_type, :value, :type
    has_many :conditions, embed: :ids
  end
end
