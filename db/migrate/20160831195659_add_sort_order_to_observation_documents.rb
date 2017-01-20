class AddSortOrderToObservationDocuments < ActiveRecord::Migration
  def change
    add_column :hanuman_observation_documents, :sort_order, :string
  end
end
