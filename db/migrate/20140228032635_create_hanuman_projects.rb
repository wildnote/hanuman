class CreateHanumanProjects < ActiveRecord::Migration
  def change
    create_table :hanuman_projects do |t|
      t.string :name
      t.references :organization, index: true
      t.string :status

      t.timestamps
    end
  end
end
