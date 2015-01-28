App.SurveyStepController = Ember.ObjectController.extend(
  needs: ["answer_choices", "answer_types", "question"]
  
  question_text: null
  selected_answer_type_id: null
  isNewQuestion: false
  validationError: false
  
  # retrieve fully editable flag from survey template to determine editing rules
  isFullyEditable: (->
    return @get('survey_template').get('fully_editable')
  ).property('survey_template.fully_editable')
  
  # questionsCount used to determine next sort_order value when adding a new question to a step
  questionsCount: (->
    return @get('questions').get('length')
  ).property('questions.length')
  
  actions:
    newQuestion: ->
      @set "isNewQuestion", true
      
    createQuestion: ->
      survey_step = @get('model')
      question = @store.createRecord('question',
        question_text: @get('question_text')
        survey_step: @get('model')
        sort_order: @get('questionsCount') + 1
      )
      controller = @
      question.set('answer_type', @get('selectedAnswerType'))
      question.save().then (question) ->
        # clear out form
        controller.set 'question_text', ''
        controller.set 'answer_type', ''
        # need to add new question to bottom of listing with the right sort order
        survey_step.get('questions').addObject(question)
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
      question.set "sort_order", index + 1
      question.save()
    @endPropertyChanges()
    
)