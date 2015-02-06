App.NewQuestionComponent = Ember.Component.extend(
  surveyStep: null
  surveyTemplate: Ember.computed.alias('surveyStep.surveyTemplate')
  isFullyEditable: Ember.computed.alias('surveyTemplate.fullyEditable')
  showAnswerChoices: false
            
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
      this.toggleProperty('isNewQuestion')
      if @get('isNewQuestion')
        @setNewModel()
      else
        @rollback()
        
)