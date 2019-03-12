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

    # these references are in place due to legacy code referencing the photos, videos and documents as such
    has_many :photos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationPhoto'
    has_many :documents, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationDocument'
    has_many :videos, -> { order :sort_order, :id }, class_name: 'Hanuman::ObservationVideo'
    # for some reason needed to add the dependent: :destroy to this has_one call even though don't need it for the photos, videos and documents has_many
    # I would think the dependent destroy on the observation_signature would work but it does not and needed it on this reference as well.
    # TODO delete the secondary has_many and has_one defintions since they are duplicate code and just rely on the above references to the real objects.
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
    # before_save :set_zero_attributes_to_nil

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

    def hide_tree!
      child_observations = Hanuman::Observation.where(question_id: self.question.child_ids, parent_repeater_id: self.repeater_id, survey_id: self.survey_id)

      # in case we have a section inside a repeater
      if child_observations.blank?
        child_observations = Hanuman::Observation.where(question_id: self.question.child_ids, parent_repeater_id: self.parent_repeater_id, survey_id: self.survey_id)
      end

      child_observations.each do |child|
        if child.question.has_children?
          child.hide_tree!
        end

        child.update_column(:hidden, true)
      end
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

    def set_zero_attributes_to_nil
      if self.repeater_id == 0
        self.repeater_id = nil
      end
      if self.parent_repeater_id == 0
        self.repeater_id = nil
      end
      if self.selectable_id == 0
        self.selectable_id = nil
      end
    end

  end
end
