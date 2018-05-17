class AddDefaultAnswerToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :default_answer, :text
  end
end
