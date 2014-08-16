module Hanuman
  class Api::V1::AnswerTypesController < ApplicationController
    respond_to :json

    def index
      respond_with AnswerType.all
    end

    def show
      respond_with AnswerType.find(params[:id])
    end
  end
end
