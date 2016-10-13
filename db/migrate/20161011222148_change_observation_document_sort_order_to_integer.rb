class ChangeObservationDocumentSortOrderToInteger < ActiveRecord::Migration
  def change
    change_column :hanuman_observation_documents, :sort_order,'integer USING CAST(sort_order AS integer)'
  end
end
