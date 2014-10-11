module Hanuman
  class QuestionSerializer < ActiveModel::Serializer
    attributes :id, :question_text, :answer_type_id, :sort_order, :survey_step_id
    has_many :answer_choices, embed: :ids
  end
end