module Hanuman
  class SurveyTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :survey_type, :steps
    has_many :survey_questions
    embed :ids
  end
end