module Hanuman
  class QuestionSerializer < ActiveModel::Serializer
    attributes :id, :question_text, :answer_type_id, :sort_order, :survey_step_id,
               :ancestry, :required, :hidden, :external_data_source, :rails_id, :parent_id,
               :capture_location_data
    has_many :answer_choices, embed: :ids
    has_one :rule

    # this is a hack to be able to temporarily display question_id in admin to help with development
    def rails_id
      object.id
    end

    # retrive data source name from data source table now instead of string external_data_source stored in question table-kdh
    def external_data_source
      objects.data_source.reference
    end
  end
end
