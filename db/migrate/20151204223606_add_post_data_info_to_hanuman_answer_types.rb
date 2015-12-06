class AddPostDataInfoToHanumanAnswerTypes < ActiveRecord::Migration
  def change
    add_column :hanuman_answer_types, :post_name, :string
    add_column :hanuman_answer_types, :post_type, :string
    add_column :hanuman_answer_types, :element_type, :string
  end
end
