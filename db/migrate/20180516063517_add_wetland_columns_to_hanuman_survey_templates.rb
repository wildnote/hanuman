class AddWetlandColumnsToHanumanSurveyTemplates < ActiveRecord::Migration
  def change
    add_column :hanuman_survey_templates, :version, :string
    add_column :hanuman_survey_templates, :lock, :boolean
    add_column :hanuman_survey_templates, :description, :string
  end
end
