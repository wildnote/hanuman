class AddGroupSortToHanumanObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :group_sort, :string, index: true
  end
end
