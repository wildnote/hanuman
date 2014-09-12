App.AnswerTypeController = Ember.ObjectController.extend
  name2: (->
    @get("model.name")
  ).property("model.name")
  section: "monkey_answer_type"