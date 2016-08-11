module Hanuman
  class Api::V1::SurveyTemplatesController < ApplicationController
    respond_to :json

    def index
      respond_with SurveyTemplate.all
    end

    def show
      respond_with SurveyTemplate.find(params[:id])
    end

    def update
      survey_template = SurveyTemplate.find(params[:id])
      survey_template.update(survey_template_params)
      respond_with survey_template
    end

    private

    def survey_template_params
      params.require(:survey_template).permit(:name, :status, :survey_type)
    end
  end
end
