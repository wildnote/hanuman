class AddSearchableToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :searchable, :boolean
  end
end
