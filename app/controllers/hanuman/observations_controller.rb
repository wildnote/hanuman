require_dependency "hanuman/application_controller"

module Hanuman
  class ObservationsController < ApplicationController
    before_action :set_observation, only: [:destroy]

    # DELETE /observations/1
    def destroy
      survey_id = @observation.survey.id
      @observation.destroy
      redirect_to survey_path(survey_id), notice: 'Observation was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_observation
        @observation = Observation.find(params[:id])
      end
  end
end
