class AddQuestionIdToObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :question_id, :integer
  end
end
