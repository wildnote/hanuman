module Hanuman
  class SurveyTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :survey_type
    has_many :survey_questions
    embed :ids
  end
end