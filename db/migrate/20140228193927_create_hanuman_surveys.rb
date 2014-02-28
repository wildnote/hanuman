class CreateHanumanSurveys < ActiveRecord::Migration
  def change
    create_table :hanuman_surveys do |t|
      t.references :survey_template, index: true
      t.references :project, index: true

      t.timestamps
    end
  end
end
