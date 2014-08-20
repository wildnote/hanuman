module Hanuman
  class Survey < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey_template
    has_many :observations, dependent: :destroy
    accepts_nested_attributes_for :observations, :allow_destroy => true#, reject_if: lambda {|attributes| attributes['answer'].blank?}
    has_one :survey_extension
    accepts_nested_attributes_for :survey_extension, :allow_destroy => true
    validates :survey_template_id, presence: true

    amoeba do
      enable
    end
    
    def survey_steps
      self.survey_template.survey_questions.collect(&:step).uniq
    end
    
    def survey_step_is_duplicator?(step)
      self.survey_template.survey_questions.by_step(step).first.duplicator
    end
    
    def observation_entries_by_step(step)
      self.observations.filtered_by_step(step).collect(&:entry).uniq
    end
    
    def max_observation_entry_by_step(step)
      self.observations.filtered_by_step(step).collect(&:entry).uniq.max
    end

    def author
      self.versions.first.whodunnit unless self.versions.blank? rescue nil
    end
    
    def survey_step_has_observations?(step)
      survey_id = self.id
      if self.survey_template.survey_questions.by_step(step).first.observations.where('hanuman_observations.survey_id = ?', survey_id).count > 0
        true
      else
        false
      end
    end
  end
end
