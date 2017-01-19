class AddMobileCreatedAtToHanumanSurveys < ActiveRecord::Migration
  def change
    add_column :hanuman_surveys, :mobile_created_at, :datetime
  end
end
