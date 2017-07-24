class AddCombineColumnsToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :combine_latlong_as_line, :boolean, default: false
    add_column :hanuman_questions, :combine_latlong_as_polygon, :boolean, default: false
  end
end
