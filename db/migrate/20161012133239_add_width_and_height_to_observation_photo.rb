class AddWidthAndHeightToObservationPhoto < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_photos, :width, :integer
    add_column :hanuman_observation_photos, :height, :integer
  end
end
