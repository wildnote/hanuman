# For more information see: http://emberjs.com/guides/routing/

App.Router.map ()->
  @resource 'survey_templates', ->
    @resource('survey_template', { path: '/:survey_template_id' })
  

App.SurveyTemplatesRoute = Ember.Route.extend({
  model: ->
    console.log("in SurveyTemplatesRoute")
    @store.findAll('survey_template')
})

App.SurveyTemplateRoute = Ember.Route.extend({
  model: (params) ->
    console.log("in SurveyTemplateRoute")
    console.log(params)
    #@store.find('survey_template', params.survey_template_id).then (survey_template) ->
    #  console.log(survey_template)
    #  @store.find('survey_question', survey_template.id)
})