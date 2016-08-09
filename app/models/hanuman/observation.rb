module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey, touch: true
    belongs_to :question
    has_many :observation_answers, dependent: :destroy
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    # this line if for multiselectr answer choices
    has_many :answer_choices, through: :observation_answers, dependent: :destroy

    has_many :observation_photos
    has_many :photos, class_name: "observation_photos"
    accepts_nested_attributes_for :observation_photos, allow_destroy: true
    has_many :observation_documents
    accepts_nested_attributes_for :observation_documents, allow_destroy: true
    has_many :observation_videos
    has_many :videos, class_name: "observation_video"
    accepts_nested_attributes_for :observation_videos, allow_destroy: true

    belongs_to :selectable, polymorphic: true

    validates_presence_of :question_id, :entry
    # no validation for answer - because of structure of data we need empty
    # rows in database for editing of survey - kdh - 10.30.14

    default_scope {includes(:question).order('hanuman_observations.entry ASC, hanuman_questions.sort_order ASC').references(:question)}

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
