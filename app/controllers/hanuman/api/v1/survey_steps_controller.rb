module Hanuman
  class Api::V1::SurveyStepsController < ApplicationController
    respond_to :json

    def index
      respond_with SurveyStep.all
    end

    def show
      respond_with SurveyStep.find(params[:id])
    end
  end
end
