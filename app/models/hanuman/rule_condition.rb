module Hanuman
  class RuleCondition < ActiveRecord::Base
    has_paper_trail
    belongs_to :rule
    belongs_to :condition, dependent: :destroy

  end
end
