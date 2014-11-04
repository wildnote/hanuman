App.AnswerChoiceController = Ember.ObjectController.extend(
  needs: ["question"]
  actions:
    editAnswerChoice: ->
      @set "isEditingAnswerChoice", true
    
    exitEditAnswerChoice: ->
      @set "isEditingAnswerChoice", false
      
    saveAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.save()
      @set "isEditingAnswerChoice", false
    
    deleteAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.deleteRecord()
      answer_choice.save()
      @set "isEditingAnswerChoice", false
      
)
