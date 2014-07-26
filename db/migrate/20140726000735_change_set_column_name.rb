class ChangeSetColumnName < ActiveRecord::Migration
  def change
    change_table :hanuman_observations do |t|
      t.rename :set, :entry
    end
  end
end
