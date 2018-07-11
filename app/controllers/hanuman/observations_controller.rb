require_dependency "hanuman/application_controller"

module Hanuman
  class ObservationsController < ApplicationController
    before_action :set_observation, only: [:destroy]

    # DELETE /observations/1
    def destroy
      s = @observation.survey
      if @observation.repeater_id.present?
        s.observations.where(parent_repeater_id: @observation.repeater_id).destroy_all
      end
      @observation.destroy
      redirect_to survey_path(s), notice: 'Observation was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_observation
        @observation = Observation.find(params[:id])
      end
  end
end
