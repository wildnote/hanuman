class AddHiddenToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :hidden, :boolean, :default => false
  end
end
