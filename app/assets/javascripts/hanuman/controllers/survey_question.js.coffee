App.SurveyQuestionController = Ember.ObjectController.extend({
  section: "monkey_survey_question"
  step2: (->
    @get("model.step2")
  ).property("model.step2")
})