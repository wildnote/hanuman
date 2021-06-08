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
    before_save :set_zero_attributes_to_nil
    before_save :set_flagged_status
    before_update -> { self.answer = nil }, if: :answer_choice_id_changed?

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
        self.parent_repeater_id = nil
      end
      if self.selectable_id == 0
        self.selectable_id = nil
      end
    end

    def check_location_metadata
      if new_record?
        return
      elsif location_metadata.present? && (latitude_changed? || longitude_changed? || speed_changed? || altitude_changed? || accuracy_changed? || direction_changed?)
        self.location_metadata = nil
      end
    end

    def children
      if question.answer_type.element_type == "container"
        o_ids = []
        question.children.joins(:observations).where("hanuman_observations.survey_id = #{survey_id}").each do |q|
          if repeater_id.present?
            o_ids << q.observations.where("hanuman_observations.survey_id = #{survey_id} AND hanuman_observations.parent_repeater_id = #{repeater_id}").first.id
          else
            o_ids << q.observations.where("hanuman_observations.survey_id = #{survey_id}").first.id
          end
        end
        return Hanuman::Observation.where(id: o_ids)
      else
        nil
      end
    end

    def get_flagged_status
      return false if question.nil?
      flagged_status = false

      unless hidden
        case self.question.answer_type.name
        when 'checkboxlist', 'chosenmultiselect'
          self.observation_answers.any? do |oa|
            flagged_status = self.question.flagged_answers.any? { |fa| fa == oa.answer_choice.option_text.strip }
          end

        when 'chosenselect', 'radio'
          flagged_status = self.answer_choice.present? && question.flagged_answers.any? { |fa| fa == self.answer_choice.option_text.strip }

        when 'checkbox', 'date', 'email', 'text', 'textarea', 'time', 'number', 'counter'
          flagged_status = self.answer.present? && self.question.flagged_answers.any? { |fa| fa == self.answer.strip }

        when 'taxonchosensingleselect', 'locationchosensingleselect'
          flagged_status = self.selectable.present? && question.flagged_answers.any? { |fa| fa == self.selectable.name.strip }

        else
          flagged_status = false
        end
      end

      flagged_status
    end

    def set_flagged_status
      self[:flagged] = get_flagged_status
      true
    end

    def update_calculation!
      return unless question.calculated?

      calculation_rule = Hanuman::CalculationRule.find_by(question_id: question_id)
      return unless calculation_rule.script.present?

      parameters = {}

      calculation_rule.conditions.map(&:question).each do |param_question|
        if param_question.ancestors.any? { |q| q.answer_type_id == 57 }
          if question.ancestors.any? { |q| q.answer_type_id == 57 }
            param_observation = survey.observations.find_by(question_id: param_question.id, parent_repeater_id: parent_repeater_id)
            parameters[param_question.api_column_name] = param_observation.native_answer
          else
            param_observations = survey.observations.where(question_id: param_question.id)
            parameters[param_question.api_column_name] = param_observations.map(&:native_answer)
          end
        else
          param_observation = survey.observations.find_by(question_id: param_question.id)
          parameters[param_question.api_column_name] = param_observation.native_answer
        end
      end

      context = Duktape::Context.new

      context.define_function("setResult") do |result|
        set_calculation_result(result)
      end

      parameters.each do |param_name, param_value|
        if param_value.is_a?(Integer) || param_value.is_a?(Float) || param_value.is_a?(TrueClass) || param_value.is_a?(FalseClass)
          param_eval_string = "$#{param_name} = #{param_value};"
        elsif param_value.is_a?(Array)
          param_eval_string = "$#{param_name} = [#{param_value.map { |v| "#{v.dump}" }.join(',')}];"
        elsif param_value.is_a?(Date)
          param_eval_string = "$#{param_name} = Date.parse('#{param_value}');"
        else
          param_eval_string = "$#{param_name} = #{param_value.dump};"
        end

        context.exec_string(param_eval_string)
      end

      context.exec_string(calculation_rule.script)
    end

    def native_answer
      case question.answer_type.element_type
      when 'checkbox'
        answer == 'true'
      when 'number', 'counter'
        if answer.nil
          0
        else
          if answer.include?('.')
            Float(answer) rescue 0
          else
            Integer(answer) rescue 0
          end
        end
      when 'multiselect', 'checkboxes'
        if observation_answers.present?
          if observation_answers.first.answer_choice_id.present?
            observation_answers.map { |oa| oa.answer_choice.option_text }
          elsif observation_answers.first.multiselectable_id.present?
            observation_answers.map { |oa| oa.multiselectable.name }
          end
        else
          []
        end
      when 'date'
        Date.parse(answer) rescue nil
      else
        pivot_answer == '' ? nil : pivot_answer
      end
    end

    def set_calculation_result(result)
      if question.answer_type.element_type == "checkbox" && (result.is_a?(TrueClass) || result.is_a?(FalseClass))
        self.answer = result ? "true" : ""
      elsif (question.answer_type.element_type == "number" || question.answer_type.element_type == "number") && result.is_a?(Float)
        self.answer = result.to_s
      elsif (question.answer_type.element_type == 'text' || question.answer_type.element_type ==  'textarea' || question.answer_type.element_type == 'time' || question.answer_type.element_type == 'date') && result.is_a?(String)
        self.answer = result
      elsif question.answer_type.element_type == 'date' && result.is_a?(Date)
        self.answer = result.to_s
      elsif (question.answer_type.element_type == "checkbox" || question.answer_type.element_type == "multiselect") && result.is_a?(Array)
        self.observation_answers.destroy_all
        if question.answer_type.name == "taxonchosenmultiselect"
          result.each do |taxon_text|
            scientific_name = taxon_text.split("/")[0].strip
            taxon = question.data_source.taxa.find_by(scientific_name: scientific_name)
            self.observation_answers.build(multiselectable: taxon)
          end
        else
          result.each do |option_text|
            ac = question.answer_choices.find_by(option_text: option_text)
            self.observation_answers.build(answer_choice: ac)
          end
        end
      elsif (question.answer_type.element_type == "select" || question.answer_type.element_type == "radio") && result.is_a?(String)
        if question.answer_type.name == "taxonchosensingleselect"
          scientific_name = result.split("/")[0].strip
          taxon = question.data_source.taxa.find_by(scientific_name: scientific_name)
          self.selectable = taxon
        elsif question.answer_type.name == "locationchosensingleselect"
          location = survey.project.locations.find_by(name: result)
          self.selectable = location
        else
          ac = question.answer_choices.find_by(option_text: result)
          self.answer_choice = ac
        end
      else
        self.answer = nil
        self.answer_choice = nil
        self.selectable = nil
        self.observation_answers.destroy_all
      end

      save
    end
  end
end
