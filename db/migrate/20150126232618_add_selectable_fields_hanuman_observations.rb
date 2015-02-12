class AddSelectableFieldsHanumanObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :selectable_id, :integer
    add_column :hanuman_observations, :selectable_type, :string
  end
end
