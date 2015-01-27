module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey
    belongs_to :question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    belongs_to :selectable, polymorphic: true
    
    validates_presence_of :question_id
    # no validation for answer - because of structure of data we need empty 
    # rows in database for editing of survey - kdh - 10.30.14
    
    default_scope {includes(:question => :survey_step).order('hanuman_survey_steps.step ASC, hanuman_observations.entry ASC, hanuman_questions.sort_order ASC').references(:question => :survey_step)}

    before_save :strip_and_squish_answer

    amoeba do
      enable
    end
    
    def step
      question.survey_step.step
    end

    def strip_and_squish_answer
      answer = answer.strip.squish unless answer.blank?
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

    def question_text
      self.question.question_text
    end

    def self.entries
      self.pluck(:entry).uniq
    end
  end
end
