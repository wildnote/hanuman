module Hanuman
  class Api::V1::SurveysController < ApplicationController
    respond_to :json

    def index
      respond_with Survey.all
    end

    def show
      respond_with Survey.find(params[:id])
    end
  end
end
