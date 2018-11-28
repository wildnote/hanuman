class AddHelperTextToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :helper_text, :string
  end
end
