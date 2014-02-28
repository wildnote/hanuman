class CreateHanumanSurveyQuestions < ActiveRecord::Migration
  def change
    create_table :hanuman_survey_questions do |t|
      t.references :survey_template, index: true
      t.references :question, index: true
      t.integer :order
      t.string :group
      t.boolean :duplicator, default: false

      t.timestamps
    end
  end
end
