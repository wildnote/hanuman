class AddSurveyDateToHanumanSurveys < ActiveRecord::Migration
  def change
    add_column :hanuman_surveys, :survey_date, :date
  end
end
