App.QuestionRowComponent = Ember.Component.extend(
  surveyStep: null
  isEditing: null
  isNewQuestionRow: null
  answerTypeId: Ember.computed('model.answerType.id', (key, value) ->
    return if @get('isDestroyed') or Ember.isEmpty(@get('model'))
    
    if (arguments.length is 1)
      answerTypeId = this.get('model.answerType.id')
    else 
      answerType = this.get('answerTypes').findBy('id', value)
      this.set('model.answerType', answerType)
      answerTypeId = value
    @answerTypeSelected()
    answerTypeId
  )
  
  answerTypeSelected: (->
    console.log "answerTypeSelected invoked"
    ##### adolfo how to refactor to a method in contoller and call #####
    question = @get('model')
   
    question.get('answerType').then (answerType) =>
      if answerType and answerType.get('hasAnswerChoices')
        @set "showAnswerChoices", true
      else
        @set "showAnswerChoices", false
    
  )
  
  setNewModel: ->
    model = @get('surveyStep').store.createRecord(
      'question',
      sortOrder: @get('surveyStep').get('questions.length') + 1
      questionText: ''
    )
    @set('model', model)
    
    
  rollback: ->
    model = @get 'model'
    
    # new cancel 
    if model and model.get('isNew')
      @get('surveyStep').get('questions').removeObject(model)
      @set('model', null)
      
    @set('showAnswerChoices', false)
  answerChoicesPendingSave: []  
  actions:
    save: ->
      @get('model').set('surveyStep', @get('surveyStep'))
      @get('model').save().then(
        =>
          promises = @get('answerChoicesPendingSave').invoke('save')
          Ember.RSVP.all(promises).then =>
            @set('answerChoicesPendingSave', [])
            @send('toggleForm')
        ,->
          console.log('failed')
      )
    saveAnswerChoice: (answerChoice) ->
      if @get('model.isNew')
        @get('answerChoicesPendingSave').push(answerChoice)
      else
        answerChoice.save()
    addNew: ->
      this.toggleProperty('isEditing')
      @setNewModel()
    toggleForm: ->
      this.toggleProperty('isEditing')
      @rollback()
        
    editQuestion: ->
      @set "isEditing", true
      question = @get('model')
      if question.get('answerType').get('hasAnswerChoices')
        @set "showAnswerChoices", true
    #   
    # exitEditQuestion: ->
    #   @get('model').rollback()
    #   @set "isEditing", false
    #   
    # saveQuestion: ->
    #   question = @get('model')
    #   controller = @
    #   question.save().then ->
    #     console.log "saved"
    #     controller.set "isEditing", false
    #   , (response) ->
    #     console.log "failed"
    #     # for error handling
        
    delete: ->
      question = @get('model')
      
      ##### adolfo need to refactor to share this method with surveyStep controller #####
      ##### call updateSortOrder(indexes)
      
      question.get('surveyStep').get('questions').removeObject(question)
      question.deleteRecord()
      question.save()
      
      
    # newAnswerChoice: ->
    #   @set "isNewAnswerChoice", true
    #   
    # exitCreateAnswerChoice: ->
    #   @set "isNewAnswerChoice", false
    #   
    # createAnswerChoice: ->
    #   question = @get('model')
    #   answer_choice = @store.createRecord('answer_choice',
    #     optionText: @get('optionText')
    #     question: @get('model')
    #   )
    #   controller = @
    #   answer_choice.save().then (answer_choice) ->
    #     controller.set('optionText', '')
    #     question.get('answerChoices').addObject(answer_choice)
    #     #controller.set "isNewAnswerChoice", false
    #   , (response) ->
    #     console.log "error"
)