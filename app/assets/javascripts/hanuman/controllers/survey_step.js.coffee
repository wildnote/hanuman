App.SurveyStepController = Ember.ObjectController.extend(
  needs: ["answer_choices", "answer_types", "question"]
  
  question_text: null
  selected_answer_type_id: null
  
  actions:
    newQuestion: ->
      @set "isNewQuestion", true
      return
    createQuestion: ->
      survey_step = @get('model')
      question = @store.createRecord('question',
        question_text: @get('question_text')
        survey_step: @get('model')
        sort_order: 100
      )
      question.set('answer_type', @get('selectedAnswerType'))
      question.save().then (question) ->
        survey_step.get('questions').addObject(question)
      
      # need to add new question to bottom of listing with the right sort order
      
      @set "isNewQuestion", false
      return
    exitCreateQuestion: ->
      @set "isNewQuestion", false
      
  isNewQuestion: false
)