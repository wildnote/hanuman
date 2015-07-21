class UpdateHasAnswerChoicesOnHanumanAnswerTypes < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_types, :answer_choice_type, :string
  end
end
