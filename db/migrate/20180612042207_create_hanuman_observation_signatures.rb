class CreateHanumanObservationSignatures < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_signatures do |t|
      t.references :observation, index: true, foreign_key: foreign_key: { on_delete: :cascade }
      t.string :signature

      t.timestamps null: false
    end
  end
end
