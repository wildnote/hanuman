class AddLatitudeLongitudeToHanumanObservationVideos < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_videos, :latitude, :float
    add_column :hanuman_observation_videos, :longitude, :float
  end
end
