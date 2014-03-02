module Hanuman
  class Survey < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :project
    has_many :observations
    accepts_nested_attributes_for :observations, :allow_destroy => true
  end
end
