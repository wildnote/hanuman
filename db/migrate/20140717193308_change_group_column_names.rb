class ChangeGroupColumnNames < ActiveRecord::Migration
  def change
    add_column :hanuman_survey_questions, :step, :integer
    remove_column :hanuman_survey_questions, :group
    change_table :hanuman_observations do |t|
      t.rename :group, :set
    end
  end
end
