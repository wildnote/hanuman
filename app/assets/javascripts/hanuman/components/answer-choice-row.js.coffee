App.AnswerChoiceRowComponent = Ember.Component.extend(

  isNewAnswerChoice: false
  showAnswerChoices: false
  answerChoice: null
  isEditingAnswerChoice: false
  question: null
  
  setNewModel: ->
    model = @get('question').store.createRecord('answerChoice',
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
      @get('model').set('question', @get('question'))
      @sendAction('save', @get('model'))
      if @get('model.isNew')  
        @set('model',null)
      @send('toggleForm')
      
    toggleForm: ->
      this.toggleProperty('isEditingAnswerChoice')
      model = @get 'model'
      unless model
        if @get('isEditingAnswerChoice')
          @setNewModel()
        # else
        #   @rollback()
        
    delete: ->
      answerChoice = @get('model')
      answerChoice.get('question').get('answerChoices').removeObject(answerChoice)
      answerChoice.deleteRecord()
      answerChoice.save()
)