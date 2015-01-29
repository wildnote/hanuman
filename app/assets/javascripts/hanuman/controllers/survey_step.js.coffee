App.SurveyStepController = Ember.ObjectController.extend(
  needs: ["answerChoices", "answerTypes", "question"]
  
  questionText: null
  selected_answerType_id: null
  isNewQuestion: false
  validationError: false
  
  # retrieve fully editable flag from survey template to determine editing rules
  isFullyEditable: (->
    return @get('surveyTemplate').get('fullyEditable')
  ).property('surveyTemplate.fullyEditable')
  
  # questionsCount used to determine next sortOrder value when adding a new question to a step
  questionsCount: (->
    return @get('questions').get('length')
  ).property('questions.length')
  
  actions:
    newQuestion: ->
      @set "isNewQuestion", true
      
    createQuestion: ->
      surveyStep = @get('model')
      question = @store.createRecord('question',
        questionText: @get('questionText')
        surveyStep: @get('model')
        sortOrder: @get('questionsCount') + 1
      )
      controller = @
      question.set('answerType', @get('selectedAnswerType'))
      question.save().then (question) ->
        # clear out form
        controller.set 'questionText', ''
        controller.set 'answerType', ''
        # need to add new question to bottom of listing with the right sort order
        surveyStep.get('questions').addObject(question)
        controller.set "isNewQuestion", false
        controller.set "validationError", false
      , (failure) ->
        console.log "failed"
        controller.set "validationError", true
      
    exitCreateQuestion: ->
      @set "isNewQuestion", false
  
  # drag and drop sort order method
  updateSortOrder: (indexes) ->
    console.log "in updateSortOrder"
    @beginPropertyChanges()
    @get('questions').forEach (question) ->
      index = indexes[question.get("id")]
      question.set "sortOrder", index + 1
      question.save()
    @endPropertyChanges()
    
)