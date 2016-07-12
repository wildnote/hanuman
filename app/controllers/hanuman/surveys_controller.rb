require_dependency "hanuman/application_controller"

module Hanuman
  class SurveysController < ApplicationController
    before_action :set_survey, only: [:show, :edit, :update, :destroy, :duplicate]

    # GET /surveys
    def index
      @surveys = Survey.all.order("hanuman_surveys.id DESC").page(params[:page])
    end

    # GET /surveys/1
    def show
      @survey_show_duplicator = Setting.enable?("survey_show_duplicator")
    end

    # GET /surveys/new
    def new
      survey_template_id = params[:survey_template_id]
      survey_template = SurveyTemplate.find survey_template_id
      @survey = Survey.new(survey_template_id: survey_template_id)
      @survey.build_survey_extension
      survey_template.survey_steps.first.questions.each do |q|
        @survey.observations.build(
          question_id: q.id,
          entry: 1
        )
      end
    end

    # GET /surveys/1/edit
    def edit
      @survey = Survey.find(params[:id])
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

      if @survey.update(survey_params)
        redirect_to @survey, notice: 'Survey step was successfully updated.'
      else
        render :edit
      end
    end

    # DELETE /surveys/1
    def destroy
      @survey.destroy
      redirect_to surveys_url, notice: 'Survey was successfully destroyed.'
    end

    # PATCH/PUT /surveys/1
    def duplicate
      survey_copy = @survey.amoeba_dup
      survey_copy.save!
      redirect_to survey_copy, notice: 'Survey was successfully duplicated.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey
        @survey = Survey.includes(:observations => [:question => [:answer_type]]).find(params[:id])
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
            :question_id,
            :answer,
            :entry,
            :answer_choice_id,
            :selectable_id,
            :selectable_type,
            :group_sort,
            answer_choice_ids: [],
            observation_photos_attributes: [
              :id,
              :photo,
              :description
            ],
            observation_videos_attributes: [
              :id,
              :video,
              :description
            ],
            observation_documents_attributes: [
              :id,
              :document,
              :description
            ]
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
            :question_id,
            :answer,
            :entry,
            :answer_choice_id,
            :selectable_id,
            :selectable_type,
            :group_sort,
            answer_choice_ids: [],
            observation_photos_attributes: [
              :id,
              :photo,
              :description
            ],
            observation_videos_attributes: [
              :id,
              :video,
              :description
            ],
            observation_documents_attributes: [
              :id,
              :document,
              :description
            ]
          ]
        )
      end
  end
end
