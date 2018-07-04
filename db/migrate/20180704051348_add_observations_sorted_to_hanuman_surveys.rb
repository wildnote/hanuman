class AddObservationsSortedToHanumanSurveys < ActiveRecord::Migration
  def change
    add_column :hanuman_surveys, :observations_sorted, :boolean
  end
end
