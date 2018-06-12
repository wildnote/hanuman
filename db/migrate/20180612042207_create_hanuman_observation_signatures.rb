class CreateHanumanObservationSignatures < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_signatures do |t|
      t.references :observation, index: true
      t.string :signature

      t.timestamps null: false
    end

    add_foreign_key :hanuman_observation_signatures, :hanuman_observations, column: :observation_id
  end
end
