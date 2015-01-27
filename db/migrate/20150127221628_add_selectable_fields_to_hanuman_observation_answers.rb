class AddSelectableFieldsToHanumanObservationAnswers < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_answers, :selectable_id, :integer
    add_column :hanuman_observation_answers, :selectable_type, :string
  end
end
