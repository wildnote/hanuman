class AddNoncomplianceToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :noncompliance, :boolean, default: false
  end
end
