module Hanuman
  class QuestionSerializer < ActiveModel::Serializer
    attributes :id, :question_text, :answer_type_id, :sort_order,
               :ancestry, :required, :hidden, :external_data_source, :rails_id, :parent_id,
               :capture_location_data, :combine_latlong_as_line, :combine_latlong_as_polygon,
               :enable_survey_history, :new_project_location, :layout_section, :layout_row,
               :layout_column, :layout_column_position, :default_answer, :child_ids,
               :export_continuation_characters

    has_many :answer_choices, embed: :ids
    has_one :rule

    # this is a hack to be able to temporarily display question_id in admin to help with development
    def rails_id
      object.id
    end
  end
end
