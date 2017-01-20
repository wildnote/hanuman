class AddSortOrderToObservationPhotos < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_photos, :sort_order, :string
  end
end
