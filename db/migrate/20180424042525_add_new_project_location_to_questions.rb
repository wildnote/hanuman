class AddNewProjectLocationToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :new_project_location, :boolean
  end
end
