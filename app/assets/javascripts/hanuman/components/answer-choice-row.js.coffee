App.AnswerChoiceRowComponent = Ember.Component.extend(

  isNewAnswerChoice: false
  showAnswerChoices: false
  answerChoice: null
  isEditingAnswerChoice: false
  question: null
  
  setNewModel: ->
    model = @get('question').get('answerChoices').content.createRecord(
      optionText: ''
    )
    @set('model', model)
    
  rollback: ->
    model = @get 'model'
    if model and model.get('isNew')
      @get('question').get('answerChoices').removeObject(model)
    @set('model', null)
  
  
  actions:
    save: ->
      @get('model').save().then(
        =>
          @set('model', null)
          @send('toggleForm')
        ,->
          console.log('failed')
      )
    toggleForm: ->
      this.toggleProperty('isEditingAnswerChoice')
      model = @get 'model'
      unless model
        if @get('isEditingAnswerChoice')
          @setNewModel()
        else
          @rollback()
        
    delete: ->
      answerChoice = @get('model')
      answerChoice.get('question').get('answerChoices').removeObject(answerChoice)
      answerChoice.deleteRecord()
      answerChoice.save()
)