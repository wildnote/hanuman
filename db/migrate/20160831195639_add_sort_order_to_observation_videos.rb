class AddSortOrderToObservationVideos < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_videos, :sort_order, :string
  end
end
