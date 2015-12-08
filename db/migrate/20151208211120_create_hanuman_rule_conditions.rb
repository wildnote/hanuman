class CreateHanumanRuleConditions < ActiveRecord::Migration
  def change
    create_table :hanuman_rule_conditions do |t|
      t.references :rule, index: true
      t.references :condition, index: true

      t.timestamps
    end
  end
end
