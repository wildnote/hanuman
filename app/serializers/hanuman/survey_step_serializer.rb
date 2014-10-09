module Hanuman
  class SurveyStepSerializer < ActiveModel::Serializer
    attributes :id, :duplicator, :step, :survey_template_id
    has_many :questions, embed: :ids
  end
end