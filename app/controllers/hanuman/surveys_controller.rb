require_dependency "hanuman/application_controller"

module Hanuman
  class SurveysController < ApplicationController
    before_action :set_survey, only: [:show, :edit, :update, :destroy, :duplicate]

    # GET /surveys
    def index
      @surveys = Survey.all
    end

    # GET /surveys/1
    def show
    end

    # GET /surveys/new
    def new
      survey_template_id = params[:survey_template_id]
      survey_template = SurveyTemplate.find survey_template_id
      @survey = Survey.new(survey_template_id: survey_template_id)
      survey_template.survey_questions.by_step(1).each do |sq|
        @survey.build_survey_extension
        @survey.observations.build(
          survey_question_id: sq.id,
          set: 0
        )
      end
    end

    # GET /surveys/1/edit
    def edit
      # if @survey.observations.filtered_by_set(params[:set]).count < 1
      #   redirect_to survey_path(@survey)
      # end
      step = params[:step]
      set = params[:set]
      @survey.survey_template.survey_questions.by_step(step).each do |sq|
        @survey.observations.build(survey_question_id: sq.id, set: set)
      end
    end

    # POST /surveys
    def create
      @survey = Survey.new(survey_params)

      if @survey.save
        #redirect_to @survey, notice: 'Survey was successfully created.'
        session[:survey_id] = @survey.id
        session[:survey_template_id] = @survey.survey_template_id
        redirect_to edit_survey_path(@survey.id, "1", "0")
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /surveys/1
    def update
      session[:survey_id] = @survey.id
      session[:survey_template_id] = @survey.survey_template_id
      set = params[:survey][:observations_attributes]['0'][:set]

      respond_to do |format|
        if @survey.update(survey_params)
          format.html { redirect_to @survey, notice: 'Survey was successfully updated.' }
          format.json {
            render json: @survey.observations.filtered_by_set(set).as_json(:include => {:observation_answers => {:methods => [:answer_choice_text, :jkdljakldjs]}}, :methods => [:question_text])
          }
        else
          format.html { render action: 'edit' }
          format.json { render json: @survey.errors, status: :unprocessable_entity }
        end
      end
    end

    # DELETE /surveys/1
    def destroy
      @survey.destroy
      redirect_to surveys_url, notice: 'Survey was successfully destroyed.'
    end

    # PATCH/PUT /users/1
    def duplicate
      survey_copy = @survey.amoeba_dup
      survey_copy.save!
      redirect_to survey_copy, notice: 'Survey was successfully duplicated.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey
        @survey = Survey.includes(:observations => [:survey_question => [:question => [:answer_type]]]).find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_params
        params.require(:survey).permit(
          :survey_template_id,
          :survey_date,
          survey_extension_attributes: [
            :id
          ],
          observations_attributes: [
            :id,
            :survey_question_id,
            :answer,
            :set,
            :answer_choice_id,
            answer_choice_ids: []
          ]
        )
      end
  end
end
