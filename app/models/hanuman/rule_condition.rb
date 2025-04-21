module Hanuman
  class RuleCondition < ActiveRecord::Base
    has_paper_trail
    belongs_to :rule, optional: true
    belongs_to :condition, dependent: :destroy, optional: true

  end
end
