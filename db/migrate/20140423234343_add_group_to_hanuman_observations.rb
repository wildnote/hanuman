class AddGroupToHanumanObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :group, :integer
  end
end
