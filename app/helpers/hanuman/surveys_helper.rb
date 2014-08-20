module Hanuman
  module SurveysHelper
    
    def step_status(survey, step, current_step = nil)
      has_observations = survey.survey_step_has_observations?(step)
      if current_step == nil
        if has_observations
          "glyphicon-ok"
        else
          "glyphicon-plus-sign"
        end
      else
        if current_step.to_i == step.to_i
          "glyphicon-pencil"
        else
          if has_observations
            "glyphicon-ok"
          else
            "glyphicon-plus-sign"
          end
        end
      end
    end
    
    def add_entry_label(current_entry, max_entry)
      if current_entry.to_i < max_entry.to_i
        "<span class='glyphicon glyphicon-pencil'></span> Next Entry".html_safe
      else
        "<span class='glyphicon glyphicon-plus'></span> Add Entry".html_safe
      end
    end
    
    def add_entry_helper_text(current_entry, max_entry)
      if current_entry.to_i < max_entry.to_i
        Hanuman::Setting.value("next_entry_helper_text")
      else
        Hanuman::Setting.value("add_entry_helper_text")
      end
    end
    
  end
end
