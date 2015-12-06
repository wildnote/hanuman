class AddExternalDataSourceToHanumanQuestion < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :external_data_source, :string
  end
end
