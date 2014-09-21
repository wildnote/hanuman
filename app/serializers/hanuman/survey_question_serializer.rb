module Hanuman
  class SurveyQuestionSerializer < ActiveModel::Serializer
    attributes :id, :sort_order, :duplicator, :step, :question_id, :survey_template_id
  end
end