class RemoveOrganizationFromHanuman < ActiveRecord::Migration
  def change
    remove_column :hanuman_survey_templates, :organization_id
    drop_table :hanuman_organizations
  end
end
