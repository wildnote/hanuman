class AddReportingLayoutFieldsToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :layout_section, :integer
    add_column :hanuman_questions, :layout_row, :integer
    add_column :hanuman_questions, :layout_column, :integer
    add_column :hanuman_questions, :layout_column_position, :string
  end
end
