class AddAnswerChoiceIdToObservations < ActiveRecord::Migration
  def change
    add_column :hanuman_observations, :answer_choice_id, :integer
  end
end
