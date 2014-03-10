module Hanuman
  module SurveysHelper
    
    def field_type field_type
      case field_type
      when "text"
        "field_text_field"
      when "date"
        "field_date_select"
      when "time"
        "field_time_select"
      else
        "field_not_supported"
      end
    end
    
  end
end
