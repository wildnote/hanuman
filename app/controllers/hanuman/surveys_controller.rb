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
      @survey_show_duplicator = Setting.enable?("survey_show_duplicator")
    end

    # GET /surveys/new
    def new
      # new handles step 1 of survey, all other steps handled in edit
      survey_template_id = params[:survey_template_id]
      survey_template = SurveyTemplate.find survey_template_id
      @survey = Survey.new(survey_template_id: survey_template_id)
      survey_template.survey_questions.by_step(1).each do |sq|
        @survey.build_survey_extension
        @survey.observations.build(
          survey_question_id: sq.id,
          entry: 1
        )
      end
    end

    # GET /surveys/1/edit
    def edit
      step = params[:step]
      entry = params[:entry]
      # build empty entry on edit to deal with first time entering data for that step/entry
      if @survey.observations.filtered_by_step_and_entry(step, entry).count < 1
        @survey.survey_template.survey_questions.by_step(step).each do |sq|
          @survey.observations.build(survey_question_id: sq.id, entry: entry)
        end
      end
    end

    # POST /surveys
    def create
      @survey = Survey.new(survey_params)

      if @survey.save
        #redirect_to @survey, notice: 'Survey was successfully created.'
        # redirect to edit survey step 2, entry 1
        redirect_to edit_survey_path(@survey.id, "2", "1")
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /surveys/1
    def update
      entry = params[:survey][:observations_attributes]['0'][:entry]
      survey_question = SurveyQuestion.find params[:survey][:observations_attributes]['0'][:survey_question_id]
      step = survey_question.step

      respond_to do |format|
        if @survey.update(survey_params_update)
          format.html {
            if step.eql? 1
              redirect_to edit_survey_path(@survey.id, "2", "1"), notice: 'Survey was successfully updated.'
            elsif step.eql? 2
              # repeat step 2
              if params[:next_step]
                redirect_to edit_survey_path(@survey.id, "2", entry.to_i + 1), notice: 'Survey was successfully updated.'
              else # done with step 2 go to step 3
                redirect_to edit_survey_path(@survey.id, "3", "1"), notice: 'Survey was successfully updated.'
              end
            else # edit from step 1 and 3 go to show
              redirect_to @survey, notice: 'Survey was successfully updated.'
            end
          }
          format.json {
            render json: @survey.observations.filtered_by_step_and_entry(step, entry).
              to_json(:include => {:observation_answers => {:methods => [:answer_choice_text]}}, :methods => [:question_text])
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
            :entry,
            :answer_choice_id,
            answer_choice_ids: []
          ]
        )
      end

      #this parameter white list is specifically for scenarios where we want to block fields on update in survey extension
      def survey_params_update
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
            :entry,
            :answer_choice_id,
            answer_choice_ids: []
          ]
        )
      end
  end
end
