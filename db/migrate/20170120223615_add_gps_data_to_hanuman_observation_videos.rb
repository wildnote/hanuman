class AddGpsDataToHanumanObservationVideos < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_videos, :speed, :float
    add_column :hanuman_observation_videos, :direction, :float
    add_column :hanuman_observation_videos, :altitude, :float
  end
end
