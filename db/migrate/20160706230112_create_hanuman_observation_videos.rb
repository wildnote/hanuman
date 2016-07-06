class CreateHanumanObservationVideos < ActiveRecord::Migration
  def change
    create_table :hanuman_observation_videos do |t|
      t.observation :references
      t.string :video
      t.text :description

      t.timestamps
    end
  end
end
