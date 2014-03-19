module Hanuman
  module SurveysHelper
    
    def needs_field? field_type
      case field_type
      when "static", "line"
        false
      else
        true
      end
    end
    
    def render_non_field field_type, text
      case field_type
      when "static"        
        ('<div class="form-center-message">' + text + '</div>').html_safe
      when "line"
        ('<div class="page-header"></div>').html_safe
      else
        nil
      end
    end
    
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
        "field_collection_check_boxes"
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
    
    def output_answers field_type, observation
      output = "<b>"
      case field_type
      when "text", "textarea", "date", "time", "typeahead"
        output += observation.answer
      when "checkbox"
        output += observation.answer == 1 ? "Checked" : "Not Checked"
      when "checkboxlist", "radio", "select", "multiselect", "chosenselect", "chosenmultiselect"
        observation.observation_answers.each do |oa|
          output += oa.answer_choice.option_text + "<br />"
        end
      end
      output += "</b>"
      output.html_safe
    end
    
  end
end
