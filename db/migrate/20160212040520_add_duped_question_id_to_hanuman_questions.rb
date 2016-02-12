class AddDupedQuestionIdToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :duped_question_id, :integer, index: true
  end
end
