module Hanuman
  class Survey < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :project
    has_many :observations, dependent: :destroy
    accepts_nested_attributes_for :observations, :allow_destroy => true
    validates :survey_template_id, :project_id, presence: true
  end
end
