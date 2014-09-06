# For more information see: http://emberjs.com/guides/routing/

App.Router.map ()->
  @resource 'survey_templates'
  @resource('survey_template', { path: 'survey_templates/:survey_template_id' })

App.SurveyTemplatesRoute = Ember.Route.extend({
  model: ->
    @store.find('survey_templates')
})

App.SurveyTemplateRoute = Ember.Route.extend({
  model: (params) ->
    console.log(params)
    @store.find('survey_template', params.survey_template_id)
})
