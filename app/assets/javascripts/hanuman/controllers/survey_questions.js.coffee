App.SurveyQuestionsController = Ember.ArrayController.extend({
  stepOnes: (->
    return @.get('model').filterBy('step', 1)
  ).property('model.@each.step')
  stepTwos: (->
    return @.get('model').filterBy('step', 2)
  ).property('model.@each.step')
  stepThrees: (->
    return @.get('model').filterBy('step', 3)
  ).property('model.@each.step')
  byStep: (->
    return @.get('model').filterBy('step', 2)
  ).property('model.@each.step')
})