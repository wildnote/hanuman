require_dependency "hanuman/application_controller"

module Hanuman
  class SurveyTemplatesController < ApplicationController
    respond_to :json, :html
    before_action :set_survey_template, only: [:show, :edit, :update, :destroy]

    # GET /survey_templates
    def index
      @survey_templates = SurveyTemplate.all
      respond_to do |format|
        format.html
        format.json {render json: @survey_templates}
      end
    end

    # GET /survey_templates/1
    def show
    end

    # GET /survey_templates/new
    def new
      @survey_template = SurveyTemplate.new
    end

    # GET /survey_templates/1/edit
    def edit
    end

    # POST /survey_templates
    def create
      @survey_template = SurveyTemplate.new(survey_template_params)

      if @survey_template.save
        redirect_to @survey_template, notice: 'Survey template was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /survey_templates/1
    def update
      if @survey_template.update(survey_template_params)
        redirect_to @survey_template, notice: 'Survey template was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /survey_templates/1
    def destroy
      @survey_template.destroy
      redirect_to survey_templates_url, notice: 'Survey template was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey_template
        @survey_template = SurveyTemplate.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_template_params
        params.require(:survey_template).permit(:name, :status, :survey_type)
      end
  end
end
