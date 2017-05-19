module Hanuman
  class Api::V1::QuestionsController < Api::V1::BaseController
    respond_to :json

    def index
      respond_with Question.all
    end

    def show
      respond_with Question.find(params[:id])
    end

    def create
      respond_with :api, :v1, Question.create(question_params)
    end

    def update
      question = Question.find(params[:id])
      question.update_attributes(question_params)
      respond_with question
    end

    def destroy
      question = Question.find(params[:id])
      respond_with question.destroy
    end

    private

    def question_params
      params.require(:question).permit(
        :question_text, :answer_type_id, :sort_order, :survey_template_id,
        :required, :external_data_source, :hidden, :parent_id, :capture_location_data
      )
    end

  end
end
