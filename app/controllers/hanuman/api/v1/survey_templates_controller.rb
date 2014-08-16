module Hanuman
  class Api::V1::SurveyTemplatesController < ApplicationController
    respond_to :json

    def index
      respond_with SurveyTemplate.all
    end

    def show
      respond_with SurveyTemplate.find(params[:id])
    end
  end
end
