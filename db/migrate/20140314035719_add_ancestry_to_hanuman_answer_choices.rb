class AddAncestryToHanumanAnswerChoices < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_choices, :ancestry, :string
  end
end
