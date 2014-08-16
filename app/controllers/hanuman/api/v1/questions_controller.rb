module Hanuman
  class Api::V1::QuestionsController < ApplicationController
    respond_to :json

    def index
      respond_with Question.all
    end

    def show
      respond_with Question.find(params[:id])
    end
  end
end
