class AddSurveyTemplateToQuestions < ActiveRecord::Migration
  def up
    add_reference :hanuman_questions, :survey_template, index: true

    Hanuman::Question.all.each do |question|
      question.update_attribute(:survey_template_id, question.survey_step.survey_template.id)
    end
  end

  def down
    remove_references :hanuman_questions, :survey_template, index: true
  end
end
