class RenameSelectableFieldsInHanumanObservationAnswers < ActiveRecord::Migration
  def change
    rename_column :hanuman_observation_answers, :selectable_id, :multiselectable_id
    rename_column :hanuman_observation_answers, :selectable_type, :multiselectable_type
  end
end
