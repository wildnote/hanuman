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
      return
    exitEditQuestion: ->
      @set "isEditing", false
      return
    saveQuestion: ->
      question = @get('model')
      # new_answer_type_id = question.get('selectedAnswerType').get('id')
      # @store.find("answer_type", new_answer_type_id).then (answer_type) ->
      #   question.set 'answer_type', answer_type
      #selectedAnswerType = @get('selectedAnswerType')
      #question.set('answer_type', selectedAnswerType)
      question.save()
      @set "isEditing", false
      return
    deleteQuestion: ->
      return
  
  isEditing: false
})