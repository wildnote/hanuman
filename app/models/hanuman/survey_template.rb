module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail

    # Constants
    STATUSES = %w(active draft inactive)

    # Scopes
    scope :all_active_sorted, -> { where("status = 'active'").order('name ASC') }

    # Relations
    has_many :survey_steps, -> { order :step }, inverse_of: :survey_template, dependent: :destroy #Deprecated
    has_many :questions, -> { order :sort_order }, dependent: :destroy
    has_many :surveys, dependent: :restrict_with_exception

    # Validations
    validates :name, presence: true
    validates :status, inclusion: { in: STATUSES }
    #validates_uniqueness_of :name MOVED THIS TO CHILD APPLICAITON TO MAKE IT SCOPED BY ORANIZATION-KDH

    amoeba do
      include_association :questions
      customize(lambda { |_original_post, new_post|
        new_post.name = "#{new_post.name} Copy / #{Time.now.strftime("%m/%d/%Y %I:%M:%S %p")}"
      })
    end

    def self.all_sorted
      order('name ASC')
    end

    def survey_step_is_duplicator?(step)
      survey_steps.by_step(step).first.duplicator
    end

    def num_reports_submitted
      surveys.count
    end

    # a survey template
    def fully_editable
      num_reports_submitted < 1 ? true : false
    end

    # after duplicating the survey template remap ancestry and rule information
    def remap_conditional_logic(old_survey_template)
      self.questions.each do |q|
        # remap ancestry and conditional logic after the duplication because the don't just copy over
        # update ancestry relationships
        unless q.ancestry.blank?
          ancestry_array = q.ancestry.split("/")
          new_ancestors = []
          ancestry_array.each do |p|
            new_ancestor = self.questions.find_by_duped_question_id p.to_i
            new_ancestors << new_ancestor.id
          end
          new_ancestors_string = new_ancestors.join("/")
          q.ancestry = new_ancestors_string
          q.save!
        end
        # update conditioanl logic rules
        q.conditions.each do |c|
          old_rule_id = c.rule_id
          new_rule = Hanuman::Rule.includes(:question).where('hanuman_rules.duped_rule_id = ? AND hanuman_questions.survey_template_id = ?', old_rule_id, self.id).references(:question).first
          if new_rule
            c.rule_id = new_rule.id
            c.save!
          end
        end
      end
    end

    # doing this at the survey template level so we only call survey save once and not all at once when a resort happens
    def resort_submitted_observations
      unless self.fully_editable
        surveys = self.surveys
        surveys.each do |s|
          s.save
        end
      end
    end
  end
end
