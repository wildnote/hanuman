module Hanuman
  class Condition < ActiveRecord::Base

    # Constants
    OPERATORS = [
      'is equal to', 'is not equal to', 'is empty', 'is not empty',
      'is greater than', 'is less than', 'starts with', 'contains'
    ]

    # Relations
    belongs_to :question
    belongs_to :rule

    # Validations
    validates :rule_id, presence: true
    validates :operator, inclusion: { in: OPERATORS }
    #validates :question_id, presence: true - this validation breaks the duplicate functionality-kdh
    #validates :answer, presence: true - is empty and is not empty have nil values for answer so we can't validate presene of answer-kdh

    # Callbacks
    after_destroy :cleanup_rule_if_single_condition

    # when a condition gets deleted, check to see of the rule attached to that condition has other conditions attached to it
    # if it does do NOT delete, if it doen NOT have any more conditions attached go ahead and delete
    def cleanup_rule_if_single_condition
      if rule.conditions.blank?
        self.rule.destroy
      end
    end
  end
end
