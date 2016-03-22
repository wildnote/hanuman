module Hanuman
  class Rule < ActiveRecord::Base
    belongs_to :question
    has_many :conditions, dependent: :destroy

    #validates :question_id, presence: true
    validates :match_type, presence: true

    MATCH_TYPES = ["any","all"]

    amoeba do
      exclude_association [:conditions]
      # set old_rule_id so I can remap the conditional logic relationships on a survey duplicate-kdh
      customize(lambda { |original_rule,new_rule|
        new_rule.duped_rule_id = original_rule.id
      })
    end
  end
end
