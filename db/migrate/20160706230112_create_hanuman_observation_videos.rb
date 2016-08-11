class CreateHanumanObservationVideos < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_videos do |t|
      t.references :observation, index: true
      t.string :video
      t.text :description

      t.timestamps
    end
  end
end
