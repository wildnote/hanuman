module Hanuman
  class Survey < ActiveRecord::Base
    belongs_to :survey_template
    belongs_to :project
  end
end
