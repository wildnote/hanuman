class RemoveProjectIdFromHanumanSurveys < ActiveRecord::Migration
  def change
    remove_column :hanuman_surveys, :project_id, :integer
  end
end
