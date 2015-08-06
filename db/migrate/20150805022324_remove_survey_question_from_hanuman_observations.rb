class RemoveSurveyQuestionFromHanumanObservations < ActiveRecord::Migration
  def change
    remove_column :hanuman_observations, :survey_question_id, :integer
  end
end
