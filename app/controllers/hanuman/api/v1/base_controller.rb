module Hanuman
  class Api::V1::BaseController < ApplicationController
    rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

    private

    def record_not_found
      render json: { success: false, errors: ['Record not found.'] }, status: :not_found
    end
  end
end
