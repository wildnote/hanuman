module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :survey, touch: true
    belongs_to :question
    belongs_to :selectable, polymorphic: true
    has_many :observation_answers, dependent: :destroy
    has_many :answer_choices, through: :observation_answers, dependent: :destroy

    accepts_nested_attributes_for :observation_answers, allow_destroy: true

    # Validations
    validates :question_id, :entry, presence: true
    # no validation for answer - because of structure of data we need empty
    # rows in database for editing of survey - kdh - 10.30.14

    # Scopes
    default_scope {includes(:question).order('hanuman_observations.entry ASC, hanuman_questions.sort_order ASC').references(:question)}

    # Callbackas
    before_save :strip_and_squish_answer

    # Delegations
    delegate :question_text, to: :question

    amoeba do
      enable
    end

    def step
      question.survey_step.step
    end

    def strip_and_squish_answer
      answer.strip.squish unless answer.blank?
    end

    def option_text
      answer.split(' / ')[0]
    end

    def scientific_text
      a = answer.split(' ( ')[0].split(' / ')[1]
      a.blank? ? '' : a
    end

    def parent_text
      a = answer.split(' ( ')[1]
      a.blank? ? '' : a.gsub(' )', '')
    end

    def self.filtered_by_entry(entry)
      includes(:question => [:survey_step, :answer_type]).
      where(entry: entry)
    end

    def self.filtered_by_step(step)
      includes(:question => [:survey_step, :answer_type]).
      where("hanuman_survey_steps.step = ?", step)
    end

    def self.filtered_by_step_and_entry(step, entry)
      includes(:question => [:survey_step, :answer_type]).
      where("hanuman_survey_steps.step = ? AND hanuman_observations.entry = ?", step, entry)
    end

    def self.entries
      self.pluck(:entry).uniq
    end
  end
end
