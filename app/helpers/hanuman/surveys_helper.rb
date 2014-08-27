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
    
  end
end
