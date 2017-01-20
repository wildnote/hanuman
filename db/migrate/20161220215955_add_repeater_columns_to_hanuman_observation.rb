class AddRepeaterColumnsToHanumanObservation < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :repeater_id, :integer
    add_column :hanuman_observations, :parent_repeater_id, :integer
  end
end
