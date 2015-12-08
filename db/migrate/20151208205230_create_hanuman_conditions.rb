class CreateHanumanConditions < ActiveRecord::Migration
  def change
    create_table :hanuman_conditions do |t|
      t.references :question, index: true
      t.string :operator
      t.string :answer

      t.timestamps
    end
  end
end
