App.AnswerChoiceController = Ember.ObjectController.extend(
  needs: ["question"]
  actions:
    saveAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.save()
    
    deleteAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.deleteRecord()
      answer_choice.save()
      
)
