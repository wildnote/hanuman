module Hanuman
  class Rule < ActiveRecord::Base
    has_paper_trail

    # Constants
    MATCH_TYPES = %w(any all)

    # Relations
    belongs_to :question
    has_many :conditions, dependent: :destroy

    # Validations
    #validates :question_id, presence: true
    validates :match_type, inclusion: { in: MATCH_TYPES }

    amoeba do
      include_association [:conditions]
      customize(lambda { |original_rule, new_rule|
        # Prevent de validation to run
        new_rule.conditions.each { |new_condition| new_condition.dup_copying = true}
        # set old_rule_id so I can remap the conditional logic relationships on a survey duplicate-kdh
        new_rule.duped_rule_id = original_rule.id
      })
    end
  end
end
