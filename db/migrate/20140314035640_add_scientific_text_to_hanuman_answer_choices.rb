class AddScientificTextToHanumanAnswerChoices < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_choices, :scientific_text, :string
  end
end
