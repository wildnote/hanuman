class DeleteProjectsTable < ActiveRecord::Migration
  def change
    drop_table :hanuman_projects
  end
end
