class AddGpsDataToHanumanObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :latitude, :float
    add_column :hanuman_observations, :longitude, :float
    add_column :hanuman_observations, :speed, :float
    add_column :hanuman_observations, :direction, :float
    add_column :hanuman_observations, :altitude, :float
  end
end
