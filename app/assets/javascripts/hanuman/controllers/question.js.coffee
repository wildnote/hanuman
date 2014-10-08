App.QuestionController = Ember.ObjectController.extend({
  needs: ["answer_choices", "answer_types"]
  
  answer_choices: (->
    Ember.ArrayProxy.createWithMixins Ember.SortableMixin,
      sortProperties: ["option_text"],
      content: @get("content.answer_choices")
  ).property("content.answer_choices")
  
  allAnswerTypes: (-> 
    @get('controllers.answer_types');
  ).property()
  
  selectedAnswerType: "12"
  
  actions:
    editQuestion: ->
      @set "isEditing", true
      return
    exitEditQuestion: ->
      @set "isEditing", false
      return
    saveQuestion: ->
      question = @get('model')
      question_text = @get('question_text')
      question.set('question_text', question_text)
      @set "isEditing", false
      return
    deleteQuestion: ->
      return
  
  isEditing: false
})