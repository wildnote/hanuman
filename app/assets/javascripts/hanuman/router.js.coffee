# For more information see: http://emberjs.com/guides/routing/

App.Router.map ()->
  @resource 'survey_templates'
  @resource('survey_template', { path: 'survey_templates/:survey_template_id' })
  @resource 'questions'
  

App.SurveyTemplatesRoute = Ember.Route.extend({
  model: ->
    console.log("in SurveyTemplatesRoute")
    @store.find('survey_template')
})

App.SurveyTemplateRoute = Ember.Route.extend({
  model: (params) ->
    console.log("in SurveyTemplateRoute")
    console.log(params)
    @store.find('surveyTemplate', params.survey_template_id)
})

# App.SurveyQuestionRoute = Ember.Route.extend({
#   model: (params) ->
#     @store.find('survey_question', params.survey_question_id)
# })

App.QuestionsRoute = Ember.Route.extend({
  model: ->
    console.log("in QuestionsRoute")
    @store.find('question')
})