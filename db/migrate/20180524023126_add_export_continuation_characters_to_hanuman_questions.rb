class AddExportContinuationCharactersToHanumanQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :export_continuation_characters, :integer
  end
end
