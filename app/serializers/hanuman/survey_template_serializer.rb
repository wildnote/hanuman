module Hanuman
  class SurveyTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :survey_type, :fully_editable
    has_many :survey_steps, embed: :ids
  end
end