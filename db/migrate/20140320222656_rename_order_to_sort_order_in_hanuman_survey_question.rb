class RenameOrderToSortOrderInHanumanSurveyQuestion < ActiveRecord::Migration
  def change
    rename_column :hanuman_survey_questions, :order, :sort_order
  end
end
