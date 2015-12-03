class AddRequiredFieldToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :required, :boolean, :default => false
  end
end
