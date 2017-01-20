class AddMobileRequestIdToHanumanSurveys < ActiveRecord::Migration
  def change
    add_column :hanuman_surveys, :mobile_request_id, :string
  end
end
