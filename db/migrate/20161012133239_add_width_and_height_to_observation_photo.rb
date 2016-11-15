class AddWidthAndHeightToObservationPhoto < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_photos, :width, :integer
    add_column :hanuman_observation_photos, :height, :integer
  rescue Exception => e
    puts "SQL error in #{ __method__ }"
    ActiveRecord::Base.connection.execute 'ROLLBACK'
  end
end
