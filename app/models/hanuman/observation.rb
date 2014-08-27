module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey
    belongs_to :survey_question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    default_scope {includes(:survey_question).order('hanuman_survey_questions.step ASC, hanuman_observations.entry ASC, hanuman_survey_questions.sort_order ASC').references(:survey_question)}

    before_save :strip_and_squish_answer

    amoeba do
      enable
    end
    
    def step
      survey_question.step
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
      includes(:survey_question => [:question => [:answer_type]]).
      where(entry: entry)
    end

    def self.filtered_by_step(step)
      includes(:survey_question => [:question => [:answer_type]]).
      where("hanuman_survey_questions.step = ?", step)
    end

    def self.filtered_by_step_and_entry(step, entry)
      includes(:survey_question => [:question => [:answer_type]]).
      where("hanuman_survey_questions.step = ? AND hanuman_observations.entry = ?", step, entry)
    end

    def question_text
      self.survey_question.question.question_text
    end

    def self.entries
      self.pluck(:entry).uniq
    end
  end
end
