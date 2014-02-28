class CreateHanumanQuestions < ActiveRecord::Migration
  def change
    create_table :hanuman_questions do |t|
      t.text :question_text
      t.references :answer_type, index: true

      t.timestamps
    end
  end
end
