class CreateHanumanRules < ActiveRecord::Migration
  def change
    create_table :hanuman_rules do |t|
      t.references :question, index: true
      t.string :match_type

      t.timestamps
    end
  end
end
