module Hanuman
  class SurveyTemplateSerializer < ActiveModel::Serializer
    def json_key
      'survey_template'
    end

    attributes :id, :name, :status, :survey_type, :fully_editable, :duplicator_label, :description, :version, :lock, :name_plus_version, :question_ids

    def duplicator_label
      Hanuman::Setting.value("duplicator_step_label")
    end

    def question_ids
      object.questions.pluck(:id)
    end
    
  end
end
