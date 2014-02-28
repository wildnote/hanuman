require_dependency "hanuman/application_controller"

module Hanuman
  class SurveysController < ApplicationController
    before_action :set_survey, only: [:show, :edit, :update, :destroy]

    # GET /surveys
    def index
      @surveys = Survey.all
    end

    # GET /surveys/1
    def show
    end

    # GET /surveys/new
    def new
      @survey = Survey.new
    end

    # GET /surveys/1/edit
    def edit
    end

    # POST /surveys
    def create
      @survey = Survey.new(survey_params)

      if @survey.save
        redirect_to @survey, notice: 'Survey was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /surveys/1
    def update
      if @survey.update(survey_params)
        redirect_to @survey, notice: 'Survey was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /surveys/1
    def destroy
      @survey.destroy
      redirect_to surveys_url, notice: 'Survey was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey
        @survey = Survey.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_params
        params.require(:survey).permit(:survey_template_id, :project_id)
      end
  end
end
