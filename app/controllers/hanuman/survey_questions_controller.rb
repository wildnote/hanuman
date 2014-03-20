require_dependency "hanuman/application_controller"

module Hanuman
  class SurveyQuestionsController < ApplicationController
    before_action :set_survey_question, only: [:show, :edit, :update, :destroy]

    # GET /survey_questions
    def index
      @survey_questions = SurveyQuestion.all
    end

    # GET /survey_questions/1
    def show
    end

    # GET /survey_questions/new
    def new
      @survey_question = SurveyQuestion.new
    end

    # GET /survey_questions/1/edit
    def edit
    end

    # POST /survey_questions
    def create
      @survey_question = SurveyQuestion.new(survey_question_params)

      if @survey_question.save
        redirect_to @survey_question, notice: 'Survey question was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /survey_questions/1
    def update
      if @survey_question.update(survey_question_params)
        redirect_to @survey_question, notice: 'Survey question was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /survey_questions/1
    def destroy
      @survey_question.destroy
      redirect_to survey_questions_url, notice: 'Survey question was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey_question
        @survey_question = SurveyQuestion.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_question_params
        params.require(:survey_question).permit(:survey_template_id, :question_id, :sort_order, :group, :duplicator)
      end
  end
end
