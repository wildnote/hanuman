require_dependency "hanuman/application_controller"

module Hanuman
  class ObservationsController < ApplicationController
    before_action :set_observation, only: [:destroy]

    # DELETE /observations/1
    def destroy
      s = Hanuman::Survey.find(@observation.survey.id)
      s.observations.where('hanuman_observations."group" = ?', @observation.group).each{|o| o.destroy}
      redirect_to survey_path(s), notice: 'Entry was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_observation
        @observation = Observation.find(params[:id])
      end
  end
end
