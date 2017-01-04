class CreateHanumanObservationDocuments < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_documents do |t|
      t.references :observation, index: true
      t.string :document
      t.text :description

      t.timestamps
    end
  end
end
