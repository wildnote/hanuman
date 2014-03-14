class AddAncestryIndexToHanumanAnswerChoices < ActiveRecord::Migration
  def change
    add_index :hanuman_answer_choices, :ancestry
  end
end
