class CreateHanumanAnswerTypes < ActiveRecord::Migration
  def change
    create_table :hanuman_answer_types do |t|
      t.string :name
      t.string :status

      t.timestamps
    end
  end
end
