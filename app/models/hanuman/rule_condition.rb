module Hanuman
  class RuleCondition < ActiveRecord::Base
    belongs_to :rule
    belongs_to :condition, dependent: :destroy

  end
end
