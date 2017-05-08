class AddCaptureLocationDataToHanumanQuestion < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :capture_location_data, :boolean, default: false
  end
end
