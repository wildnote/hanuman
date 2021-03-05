module Hanuman
  class Api::V1::AnswerChoicesController < Api::V1::BaseController
    respond_to :json

    def index
      respond_with AnswerChoice.all
    end

    def show
      respond_with AnswerChoice.find(params[:id])
    end

    def create
      respond_with :api, :v1, AnswerChoice.create(answer_choice_params)
    end

    def update
      answer_choice = AnswerChoice.find(params[:id])
      answer_choice.update(answer_choice_params)
      respond_with answer_choice
    end

    def destroy
      answer_choice = AnswerChoice.find(params[:id])
      respond_with answer_choice.destroy
    end

    private

    def answer_choice_params
      params.require(:answer_choice).permit(:option_text, :question_id, :scientific_text, :sort_order, :definition)
    end
  end
end
