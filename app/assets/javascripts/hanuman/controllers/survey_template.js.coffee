App.SurveyTemplateController = Ember.ObjectController.extend({
  needs: ["survey_questions", "survey_question", "answer_type"]
  section: "monkey_survey_template"
  name2: (->
    @get("model.name")
  ).property("model.name")
  answer_type_name2: Ember.computed.alias("controllers.answer_type.name2")
})