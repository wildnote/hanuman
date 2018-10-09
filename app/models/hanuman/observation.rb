module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :survey#, touch: true -kdh removing touch to we don't update surveys table everytime the observations table is updated
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
    has_one :observation_signature, dependent: :destroy
    accepts_nested_attributes_for :observation_signature, allow_destroy: true

    has_many :photos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationPhoto', dependent: :destroy
    has_many :documents, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationDocument', dependent: :destroy
    has_many :videos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationVideo', dependent: :destroy
    has_one :signature, class_name: 'Hanuman::ObservationSignature', dependent: :destroy

    belongs_to :selectable, polymorphic: true

    # Validations
    validates :question_id, presence: true
    # no validation for answer - because of structure of data we need empty
    # rows in database for editing of survey - kdh - 10.30.14

    # Scopes
    default_scope {
      includes(:question).order('hanuman_observations.parent_repeater_id ASC, hanuman_questions.sort_order ASC')
        .references(:question)
    }

    # Callbackas
    before_save :strip_and_squish_answer

    # Delegations
    delegate :question_text, to: :question
    delegate :survey_template, to: :question

    amoeba do
      exclude_associations :observation_photos
      exclude_associations :photos
      exclude_associations :observation_videos
      exclude_associations :videos
      exclude_associations :observation_documents
      exclude_associations :documents
      exclude_associations :observation_signature
      exclude_associations :signature
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
  end
end
