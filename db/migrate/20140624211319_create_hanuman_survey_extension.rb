class CreateHanumanSurveyExtension < ActiveRecord::Migration
  def change
    create_table :hanuman_survey_extensions do |t|
      t.integer :survey_id

      t.timestamps
    end
  end
end
