module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :survey, touch: true
    belongs_to :question
    belongs_to :selectable, polymorphic: true
    has_many :observation_answers, dependent: :destroy
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    belongs_to :answer_choice

    has_many :observation_photos, dependent: :destroy
    accepts_nested_attributes_for :observation_photos, allow_destroy: true
    has_many :observation_documents, dependent: :destroy
    accepts_nested_attributes_for :observation_documents, allow_destroy: true
    has_many :observation_videos, dependent: :destroy
    accepts_nested_attributes_for :observation_videos, allow_destroy: true

    has_many :photos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationPhoto'
    has_many :documents, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationDocument'
    has_many :videos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationVideo'

    belongs_to :selectable, polymorphic: true

    # Validations
    validates :question_id, :entry, presence: true
    # no validation for answer - because of structure of data we need empty
    # rows in database for editing of survey - kdh - 10.30.14

    # Scopes
    default_scope {
      includes(:question).order('hanuman_observations.entry ASC, hanuman_questions.sort_order ASC')
        .references(:question)
    }
    scope :by_survey_template_and_entry, -> (survey_template, entry) do
      includes(question: [:survey_template, :answer_type])
      .where(hanuman_survey_templates: {id: survey_template.id}, entry: entry)
    end

    # Callbackas
    before_save :strip_and_squish_answer

    # Delegations
    delegate :question_text, to: :question
    delegate :survey_template, to: :question

    amoeba do
      enable
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

    def self.entries
      self.pluck(:entry).uniq
    end
  end
end
