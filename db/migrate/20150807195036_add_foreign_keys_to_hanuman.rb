class AddForeignKeysToHanuman < ActiveRecord::Migration
  def change
    add_foreign_key "hanuman_observation_answers", "hanuman_observations", name: "hanuman_observation_answers_observation_id_fk", column: "observation_id"
    add_foreign_key "hanuman_observations", "hanuman_questions", name: "hanuman_observations_question_id_fk", column: "question_id"
    add_foreign_key "hanuman_observations", "hanuman_surveys", name: "hanuman_observations_survey_id_fk", column: "survey_id"
    add_foreign_key "hanuman_survey_extensions", "projects", name: "hanuman_survey_extensions_project_id_fk"
    add_foreign_key "hanuman_survey_extensions", "hanuman_surveys", name: "hanuman_survey_extensions_survey_id_fk", column: "survey_id"
    add_foreign_key "hanuman_survey_extensions", "users", name: "hanuman_survey_extensions_user_id_fk"
    add_foreign_key "hanuman_surveys", "hanuman_survey_templates", name: "hanuman_surveys_survey_template_id_fk", column: "survey_template_id"
  end
end
