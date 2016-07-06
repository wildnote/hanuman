class CreateHanumanObservationDocuments < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_documents do |t|
      t.observation :references
      t.string :document
      t.text :description

      t.timestamps
    end
  end
end
