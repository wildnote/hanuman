module Hanuman
  module SurveysHelper
    
    def step_status(survey, step, current_step = nil)
      has_observations = survey.survey_step_has_observations?(step)
      if current_step == nil
        if has_observations
          "glyphicons-ok"
        else
          "glyphicons-plus-sign"
        end
      else
        if current_step.to_i == step.to_i
          "glyphicons-pencil"
        else
          if has_observations
            "glyphicons-ok"
          else
            "glyphicons-plus-sign"
          end
        end
      end
    end
    
  end
end
