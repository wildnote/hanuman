class AddMaxPhotosToQuestions < ActiveRecord::Migration
  def change
    add_column :hanuman_questions, :max_photos, :integer
  end
end
