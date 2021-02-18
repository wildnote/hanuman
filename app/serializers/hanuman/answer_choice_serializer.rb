module Hanuman
  class AnswerChoiceSerializer < ActiveModel::Serializer
    attributes :id, :option_text, :scientific_text, :question_id, :group_text, :sort_order, :definition

    def group_text
      object.parent.option_text unless object.parent.blank?
    end
  end
end