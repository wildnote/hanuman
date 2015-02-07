App.QuestionRowComponent = Ember.Component.extend(
  surveyStep: null
  isEditing: null
  isNewQuestionRow: null
  isFullyEditable: null
  
  answerTypeSelected: (->
    console.log "answerTypeSelected invoked"
    ##### adolfo how to refactor to a method in contoller and call #####
    question = @get('model')
    controller = @
    if question and question.get('answerType')
      question.get('answerType').then (answerType) =>
        if answerType.get('hasAnswerChoices')
          controller.set "showAnswerChoices", true
        else
          controller.set "showAnswerChoices", false
      
  ).observes('model.answerType.content').on('init')
  
  setNewModel: ->
    model = @get('surveyStep').get('questions').content.createRecord(
      sortOrder: @get('surveyStep').get('questions.length') + 1
      questionText: ''
    )
    @set('model', model)
    
  rollback: ->
    model = @get 'model'
    if model and model.get('isNew')
      @get('surveyStep').get('questions').removeObject(model)
      @set('model', null)
    @set('showAnswerChoices', false)
    
  actions:
    save: ->
      @get('model').save().then(
        =>
          @send('toggleForm')
        ,->
          console.log('failed')
      )
    toggleForm: ->
      this.toggleProperty('isEditing')
      model = @get 'model'
      unless model
        @setNewModel()
      else
        @rollback()
        
    editQuestion: ->
      @set "isEditing", true
      question = @get('model')
      if question.get('answerType').get('hasAnswerChoices')
        @set "showAnswerChoices", true
      
    exitEditQuestion: ->
      @get('model').rollback()
      @set "isEditing", false
      
    saveQuestion: ->
      question = @get('model')
      controller = @
      question.save().then ->
        console.log "saved"
        controller.set "isEditing", false
      , (response) ->
        console.log "failed"
        # for error handling
        
    deleteQuestion: ->
      question = @get('model')
      
      ##### adolfo need to refactor to share this method with surveyStep controller #####
      ##### call updateSortOrder(indexes)
      
      question.get('surveyStep').get('questions').removeObject(question)
      question.deleteRecord()
      question.save()
      
      
    newAnswerChoice: ->
      @set "isNewAnswerChoice", true
      
    exitCreateAnswerChoice: ->
      @set "isNewAnswerChoice", false
      
    createAnswerChoice: ->
      question = @get('model')
      answer_choice = @store.createRecord('answer_choice',
        optionText: @get('optionText')
        question: @get('model')
      )
      controller = @
      answer_choice.save().then (answer_choice) ->
        controller.set('optionText', '')
        question.get('answerChoices').addObject(answer_choice)
        #controller.set "isNewAnswerChoice", false
      , (response) ->
        console.log "error"
)