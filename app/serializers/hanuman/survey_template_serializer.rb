module Hanuman
  class SurveyTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :status, :survey_type
    has_many :survey_steps
    #embed :ids
  end
end