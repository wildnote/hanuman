class AddDupedRuleIdToHanumanRules < ActiveRecord::Migration
  def change
    add_column :hanuman_rules, :duped_rule_id, :integer, index: true
  end
end
