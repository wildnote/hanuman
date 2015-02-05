App.QuestionController = Ember.ObjectController.extend({
  needs: ["answerChoices", "surveyStep"]
  
  answerTypes: Ember.computed (->
    @store.all('answerType')
  )
  sortedAnswerTypes: Ember.computed('answerTypes.[]', ->
    @get('answerTypes').sortBy('name')
  )
  
  # called inside question controller because of has_many relationship for each question-kdh
  answerChoices: (->
    Ember.ArrayProxy.createWithMixins Ember.SortableMixin,
      sortProperties: ["groupText","optionText"],
      content: @get("content.answerChoices")
  ).property("content.answerChoices")
  
  # sort answerChoices by groupText, optionText
  # filter out null groupText since those are parents and don't want them in select
  grouped_answerChoices: (->
    Ember.ArrayProxy.createWithMixins Ember.SortableMixin,
      sortProperties: ["groupText","optionText"],
      content: @.get("content.answerChoices").filter (answer_choice) ->
        if answer_choice.get('groupText') 
          answer_choice
  ).property("content.answerChoices")
  
  root_level_answerChoices: (-> 
    return @.get("content.answerChoices").filterBy('groupText', '')
  ).property("content.answerChoices")
  
  # retrieve fully editable flag from survey template to determine editing rules
  isFullyEditable: (->
    return @get('surveyStep').get('surveyTemplate').get('fullyEditable')
  ).property('surveyStep.surveyTemplate.fullyEditable')
  
  # answerTypeSelected: (->
  #   console.log("answerTypes changed")
  # ).observes('content.answerType.content')
  
  actions:
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
      
  
  isEditing: false
  isNewAnswerChoice: false
  showAnswerChoices: false
})