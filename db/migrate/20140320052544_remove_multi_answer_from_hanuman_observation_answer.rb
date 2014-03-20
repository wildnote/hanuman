class RemoveMultiAnswerFromHanumanObservationAnswer < ActiveRecord::Migration
  def change
    remove_column :hanuman_observation_answers, :multi_answer, :string
  end
end
