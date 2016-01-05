class AddAncestryToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :ancestry, :string
    add_index :hanuman_questions, :ancestry
  end
end
