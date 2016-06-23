require_dependency "hanuman/application_controller"

module Hanuman
  class ObservationPhotosController < ApplicationController
    before_action :set_observation_photo, only: [:show, :edit, :update, :destroy]

    # GET /observation_photos
    def index
      @observation_photos = ObservationPhoto.all
    end

    # GET /observation_photos/1
    def show
    end

    # GET /observation_photos/new
    def new
      @observation_photo = ObservationPhoto.new
    end

    # GET /observation_photos/1/edit
    def edit
    end

    # POST /observation_photos
    def create
      @observation_photo = ObservationPhoto.new(observation_photo_params)

      if @observation_photo.save
        redirect_to @observation_photo, notice: 'Observation photo was successfully created.'
      else
        render :new
      end
    end

    # PATCH/PUT /observation_photos/1
    def update
      if @observation_photo.update(observation_photo_params)
        redirect_to @observation_photo, notice: 'Observation photo was successfully updated.'
      else
        render :edit
      end
    end

    # DELETE /observation_photos/1
    def destroy
      @observation_photo.destroy
      redirect_to observation_photos_url, notice: 'Observation photo was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_observation_photo
        @observation_photo = ObservationPhoto.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def observation_photo_params
        params.require(:observation_photo).permit(:references, :photo, :description, :latitude, :longitude)
      end
  end
end
