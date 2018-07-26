class AddSortOrderToHanumanObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :sort_order, :integer
  end
end
