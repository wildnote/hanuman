class AddRuleIdToHanumanConditions < ActiveRecord::Migration
  def change
    add_reference :hanuman_conditions, :rule, index: true
  end
end
