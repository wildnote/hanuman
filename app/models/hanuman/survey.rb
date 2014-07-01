module Hanuman
  class Survey < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey_template
    belongs_to :project
    has_many :observations, dependent: :destroy
    accepts_nested_attributes_for :observations, :allow_destroy => true#, reject_if: lambda {|attributes| attributes['answer'].blank?}
    has_one :survey_extension
    accepts_nested_attributes_for :survey_extension, :allow_destroy => true
    validates :survey_template_id, :project_id, presence: true

    amoeba do
      enable
    end
    
    def observation_groups
      self.observations.collect(&:group).uniq
    end
    
    def author
      self.versions.first.whodunnit unless self.versions.blank?
    end
  end
end
