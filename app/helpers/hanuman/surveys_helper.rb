module Hanuman
  module SurveysHelper
    
    def field_type field_type
      case field_type
      when "text"
        "field_text_field"
      when "textarea"
        "field_text_area"
      when "date"
        "field_date_select"
      when "time"
        "field_time_select"
      when "checkbox"
        "field_check_box"
      when "checkboxlist"
        "field_check_box_list"
      when "radio"
        "field_radio_button"
      when "select"
        "field_collection_select"
      when "multiselect"
        "field_collection_multi_select"
      when "typeahead"
        "field_type_ahead"
      when "chosenselect"
        "field_chosen_collection_select"
      when "chosenmultiselect"
        "field_chosen_collection_multi_select"
      else
        "field_not_supported"
      end
    end
    
  end
end
