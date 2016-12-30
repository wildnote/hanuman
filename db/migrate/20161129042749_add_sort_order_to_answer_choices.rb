class AddSortOrderToAnswerChoices < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_choices, :sort_order, :integer
  end
end
