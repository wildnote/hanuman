module Hanuman
  class Api::V1::AnswerChoicesController < ApplicationController
    respond_to :json

    def index
      respond_with AnswerChoice.all
    end

    def show
      respond_with AnswerChoice.find(params[:id])
    end
  end
end
