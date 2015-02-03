App.AnswerChoiceController = Ember.ObjectController.extend(
  needs: ["question"]
  actions:
    editAnswerChoice: ->
      @set "isEditingAnswerChoice", true
    
    exitEditAnswerChoice: ->
      @get('model').rollback()
      @set "isEditingAnswerChoice", false
      
    saveAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.save().then (answer_choice) ->
        @set "isEditingAnswerChoice", false
      , (response) ->
        console.log "error"
    
    deleteAnswerChoice: ->
      answer_choice = @get('model')
      answer_choice.get('question').get('answerChoices').removeObject(answer_choice)
      answer_choice.deleteRecord()
      answer_choice.save()
      #@set "isEditingAnswerChoice", false
      
)
