class CreateHanumanObservationPhotos < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_photos do |t|
      t.references :observation, index: true
      t.string :photo
      t.text :description
      t.float :latitude
      t.float :longitude

      t.timestamps
    end
  end
end
