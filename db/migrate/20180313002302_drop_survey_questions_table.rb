class DropSurveyQuestionsTable < ActiveRecord::Migration
  def up
    drop_table :hanuman_survey_questions
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
