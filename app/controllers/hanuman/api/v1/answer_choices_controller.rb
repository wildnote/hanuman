module Hanuman
  class Api::V1::AnswerChoicesController < ApplicationController
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
      respond_with answer_choice.update(answer_choice_params)
    end

    def destroy
      respond_with answer_choice.destroy
    end

    private

    def answer_choice
      AnswerChoice.find(params[:id])
    end

    def answer_choice_params
      params.require(:answer_choice).permit(:option_text, :question_id, :scientific_text)
    end
  end
end
