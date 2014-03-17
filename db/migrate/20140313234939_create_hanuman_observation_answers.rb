class CreateHanumanObservationAnswers < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_answers do |t|
      t.integer :observation_id
      t.text :multi_answer
      t.integer :answer_choice_id

      t.timestamps
    end
  end
end
