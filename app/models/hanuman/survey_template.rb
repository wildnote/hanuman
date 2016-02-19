module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail
    has_many :survey_steps, -> { order :step }, inverse_of: :survey_template, dependent: :destroy
    has_many :questions, through: :survey_steps, dependent: :destroy
    has_many :surveys, dependent: :restrict_with_exception

    validates_presence_of :name
    #validates_uniqueness_of :name MOVED THIS TO CHILD APPLICAITON TO MAKE IT SCOPED BY ORANIZATION-KDH

    amoeba do
      include_association :survey_steps
      prepend name: "Copy " + Time.now.strftime("%m/%d/%Y %I:%M:%S %p") + " (PLEASE RENAME) - "
      set status: "draft"
    end

    STATUSES = ["draft", "active", "inactive"]

    def self.all_sorted
      order("name ASC")
    end

    def self.all_active_sorted
      where("status = 'active'").order("name ASC")
    end

    def survey_step_is_duplicator?(step)
      self.survey_steps.by_step(step).first.duplicator
    end

    def num_reports_submitted
      self.surveys.count
    end

    # a survey template
    def fully_editable
      num_reports_submitted < 1 ? true : false
    end

    # after duplicating the survey template remap ancestry and rule information
    def remap_conditional_logic(old_survey_template)
      self.questions.each do |q|
        unless q.ancestry.blank?
          new_parent = self.questions.find_by_duped_question_id q.ancestry.to_i
          q.ancestry = new_parent.id.to_s
          q.save!
        end
        q.conditions.each do |c|
          old_rule_id = c.rule_id
          new_rule = Hanuman::Rule.includes(question: :survey_step).where("hanuman_rules.duped_rule_id = ? AND hanuman_survey_steps.survey_template_id = ?", old_rule_id, self.id).references(question: :survey_step).first
          c.rule_id = new_rule.id
          c.save!
        end
      end
    end
  end
end
