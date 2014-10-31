App.QuestionController = Ember.ObjectController.extend({
  needs: ["answer_choices", "answer_types", "survey_step"]
  
  answer_choices: (->
    Ember.ArrayProxy.createWithMixins Ember.SortableMixin,
      sortProperties: ["option_text"],
      content: @get("content.answer_choices")
  ).property("content.answer_choices")
  
  actions:
    editQuestion: ->
      @set "isEditing", true
      
    exitEditQuestion: ->
      @set "isEditing", false
      
    saveQuestion: ->
      question = @get('model')
      question.save()
      @set "isEditing", false
      
    deleteQuestion: ->
      question = @get('model')
      question.deleteRecord()
      question.save()
      
    editAnswerChoices: ->
      @set "isEditingAnswerChoices", true
      
    newAnswerChoice: ->
      @set "isNewAnswerChoice", true
      
    exitCreateAnswerChoice: ->
      @set "isNewAnswerChoice", false
      
    createAnswerChoice: ->
      question = @get('model')
      answer_choice = @store.createRecord('answer_choice',
        option_text: @get('option_text')
        question: @get('model')
      )
      controller = @
      answer_choice.save().then (answer_choice) ->
        controller.set('option_text', '')
        question.get('answer_choices').addObject(answer_choice)
      @set "isNewAnswerChoice", false
  
  isEditing: false
  isNewAnswerChoice: false
})