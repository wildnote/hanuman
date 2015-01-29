App.AnswerTypeController = Ember.ObjectController.extend(
  # must define AnswerTypeController as an ObjectController for the belongsTo to work
)

App.SelectedAnswerTypeController = Ember.ObjectController.extend(
  answerType: null
)