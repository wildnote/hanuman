class CreateHanumanSurveySteps < ActiveRecord::Migration
  def change
    create_table :hanuman_survey_steps do |t|
      t.integer :survey_template_id
      t.integer :step
      t.boolean :duplicator

      t.timestamps
    end
  end
end
