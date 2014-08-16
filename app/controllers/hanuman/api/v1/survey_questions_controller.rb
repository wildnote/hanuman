module Hanuman
  class Api::V1::SurveyQuestionsController < ApplicationController
    respond_to :json

    def index
      respond_with SurveyQuestion.all
    end

    def show
      respond_with SurveyQuestion.find(params[:id])
    end
  end
end
