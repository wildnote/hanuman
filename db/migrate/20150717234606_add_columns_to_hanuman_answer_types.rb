class AddColumnsToHanumanAnswerTypes < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_types, :description, :string
    add_column :hanuman_answer_types, :descriptive_name, :string
    add_column :hanuman_answer_types, :has_answer_choices, :boolean, default: false, null: false
    add_column :hanuman_answer_types, :external_data_source, :string
  end
end
