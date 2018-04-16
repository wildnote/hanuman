class AddEnableSurveyHistoryToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :enable_survey_history, :bool
  end
end
