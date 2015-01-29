App.NewQuestionComponent = Ember.Component.extend(
  layoutName: 'components/new_question'
  surveyStep: null
  surveyTemplate: Ember.computed.alias('surveyStep.surveyTemplate')
  isFullyEditable: Ember.computed.alias('surveyTemplate.fullyEditable')
  
  setNewModel: ->
    model = @get('surveyStep').get('questions').content.createRecord(
      sortOrder: @get('surveyStep').get('questions.length')
      questionText: ''
    )
    @set('model', model)
    
  rollback: ->
    model = @get 'model'
    if model and model.get('isNew')
      @get('surveyStep').get('questions').removeObject(model)
    @set('model', null)
    
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