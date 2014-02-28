class CreateHanumanSurveyTemplates < ActiveRecord::Migration
  def change
    create_table :hanuman_survey_templates do |t|
      t.string :name
      t.string :status
      t.references :organization, index: true
      t.string :survey_type

      t.timestamps
    end
  end
end
