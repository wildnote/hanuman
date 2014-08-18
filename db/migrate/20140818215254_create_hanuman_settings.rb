class CreateHanumanSettings < ActiveRecord::Migration
  def change
    create_table :hanuman_settings do |t|
      t.string :key
      t.string :value

      t.timestamps
    end
  end
end
