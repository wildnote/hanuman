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
      model = @get 'model'
      surveyStep = @get('surveyStep')
      @get('model').set('surveyStep', @get('surveyStep'))
      @get('model').save().then (question) =>
        # loop through answerChoicesPendingSave and set question_id or question
        @get('answerChoicesPendingSave').forEach (answerChoice) ->
          answerChoice.set('question', question)
        promises = @get('answerChoicesPendingSave').invoke('save')
        Ember.RSVP.all(promises).then =>
          @set('answerChoicesPendingSave', [])
          @send('toggleForm')
      ,->
        console.log('failed')
        surveyStep.get('questions').removeObject(model)


    saveAnswerChoice: (answerChoice) ->
      if @get('model.isNew')
        #answerChoice.set('question', this.get('model'))
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

    delete: ->
      console.log "called delete action from question-row component"
      question = @get('model')

      ##### adolfo need to refactor to share this method with surveyStep controller #####
      ##### call updateSortOrder(indexes)

      surveyStep = question.get('surveyStep')

      question.get('surveyStep').get('questions').removeObject(question)
      question.deleteRecord()
      question.save()

      indexes = {}
      $('.sortable').find(".item").each (index) ->
        indexes[$(this).data("id")] = index

      # duplicate code alert, should just be able to call this method in surveyStep controller
      # updateSortOrder indexes

      @beginPropertyChanges()
      surveyStep.get('questions').forEach (question) ->
        index = indexes[question.get("id")]
        question.set "sortOrder", index + 1
        question.save()
      @endPropertyChanges()

)
