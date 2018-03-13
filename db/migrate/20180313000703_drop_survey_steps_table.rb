class DropSurveyStepsTable < ActiveRecord::Migration
  def up
    drop_table :hanuman_survey_steps
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
