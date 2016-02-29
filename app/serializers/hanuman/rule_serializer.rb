module Hanuman
  class RuleSerializer < ActiveModel::Serializer
    attributes :id, :match_type
    has_many :conditions, embed: :ids
    def hidden
      object.question.hidden
    end
  end
end
