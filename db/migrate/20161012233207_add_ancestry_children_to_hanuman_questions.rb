class AddAncestryChildrenToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :ancestry_children, :text, array: true, default: []
  end
end
