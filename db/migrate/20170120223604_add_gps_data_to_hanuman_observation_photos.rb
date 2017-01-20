class AddGpsDataToHanumanObservationPhotos < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_photos, :speed, :float
    add_column :hanuman_observation_photos, :direction, :float
    add_column :hanuman_observation_photos, :altitude, :float
  end
end
