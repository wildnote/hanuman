module Hanuman
  class Rule < ActiveRecord::Base
    has_paper_trail

    # Delegations
    # delegate :update_observation_visibility, to: :condition

    # Constants
    MATCH_TYPES = %w(any all)

    # Relations
    belongs_to :question, optional: true
    has_many :conditions, dependent: :destroy
    after_commit :update_observation_visibility

    # Always include conditions when loading a rule
    default_scope { includes(:conditions) }

    # Validations
    #validates :question_id, presence: true
    validates :match_type, inclusion: { in: MATCH_TYPES }

    amoeba do
      propagate
      include_association :conditions
      exclude_association :deltas
      customize(lambda { |original_rule, new_rule|
        new_rule.duped_rule_id = original_rule.id
      })
    end

    def update_observation_visibility
      unless self.question.blank? || self.question.survey_template.blank?
        self.question.survey_template.surveys.where(observation_visibility_set: true).each do |s|
          s.update_column(:observation_visibility_set, false)
        end
      end
    end

    # Debug method to check validation status
    def validation_debug_info
      {
        id: id,
        question_id: question_id,
        match_type: match_type,
        duped_rule_id: duped_rule_id,
        valid: valid?,
        errors: errors.full_messages,
        conditions_count: conditions.count,
        conditions: conditions.map(&:validation_debug_info)
      }
    end
  end
end
