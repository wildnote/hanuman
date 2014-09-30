require_dependency "hanuman/application_controller"

module Hanuman
  class SurveyStepsController < ApplicationController
    before_action :set_survey_step, only: [:show, :edit, :update, :destroy]

    # GET /survey_steps
    def index
      @survey_steps = SurveyStep.all
    end

    # GET /survey_steps/1
    def show
    end

    # GET /survey_steps/new
    def new
      @survey_step = SurveyStep.new
    end

    # GET /survey_steps/1/edit
    def edit
    end

    # POST /survey_steps
    def create
      @survey_step = SurveyStep.new(survey_step_params)

      if @survey_step.save
        redirect_to @survey_step, notice: 'Survey step was successfully created.'
      else
        render :new
      end
    end

    # PATCH/PUT /survey_steps/1
    def update
      if @survey_step.update(survey_step_params)
        redirect_to @survey_step, notice: 'Survey step was successfully updated.'
      else
        render :edit
      end
    end

    # DELETE /survey_steps/1
    def destroy
      @survey_step.destroy
      redirect_to survey_steps_url, notice: 'Survey step was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey_step
        @survey_step = SurveyStep.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_step_params
        params.require(:survey_step).permit(:survey_template_id, :step, :duplicator)
      end
  end
end
