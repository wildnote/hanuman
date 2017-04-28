module Hanuman
  class SurveyStep < ActiveRecord::Base
    # Relations
    belongs_to :survey_template, inverse_of: :survey_steps
    has_many :questions, -> { order :sort_order }, dependent: :destroy

    # Validations
    validates :survey_template, presence: true
    validates :step, presence: true, uniqueness: { scope: :survey_template_id }

    # Scopes
    scope :by_step, ->(step) { where(step: step) }

    amoeba { enable }
  end
end
