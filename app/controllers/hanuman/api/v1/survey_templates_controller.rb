module Hanuman
  class Api::V1::SurveyTemplatesController < Api::V1::BaseController
    before_action :set_survey_template, only: [:show, :update, :duplicate]

    respond_to :json

    def paper_trail_enabled_for_controller
      request.params[:action] != 'resort_questions'
    end

    def index
      respond_with SurveyTemplate.all
    end

    def show
      respond_with @survey_template
    end

    def create
      respond_with :api, :v1, SurveyTemplate.create(survey_template_params)
    end

    def update
      @survey_template.update(survey_template_params)
      respond_with @survey_template
    end

    def duplicate
      survey_template_copy = @survey_template.amoeba_dup
      survey_template_copy.remap_conditional_logic(@survey_template) if survey_template_copy.save
      respond_with survey_template_copy
    end

    def destroy
      survey_template = SurveyTemplate.find(params[:id])
      if survey_template.fully_editable
        respond_with survey_template.destroy
      else
        render json: { "errors" => [ { "detail": "associated-data-restriction" } ] }, status: :unprocessable_entity
      end
    end

    def resort_questions
      survey_template = SurveyTemplate.find(params[:id])
      single_update_statement = {}
      params[:ids].each_with_index do |id, i|
        single_update_statement[id] = { sort_order: i + 1 }
      end
      Question.update(single_update_statement.keys, single_update_statement.values)
      respond_with survey_template
    end

    private

    def set_survey_template
      @survey_template = SurveyTemplate.find(params[:id])
    end

    def survey_template_params
      params.require(:survey_template).permit(:name, :status, :survey_type)
    end
  end
end
