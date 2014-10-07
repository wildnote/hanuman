class AddSurveyStepToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :survey_step_id, :integer
    add_column :hanuman_questions, :sort_order, :integer
  end
end
