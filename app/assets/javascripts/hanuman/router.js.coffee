# For more information see: http://emberjs.com/guides/routing/

App.Router.map ()->
  @resource 'survey_templates'
  @resource 'survey_template', 
    path: 'survey_templates/:survey_template_id'
  @resource 'survey_step',
    path: 'survey_templates/:survey_template_id/survey_steps/:survey_step_id'

  

App.SurveyTemplatesRoute = Ember.Route.extend({
  model: ->
    console.log("in SurveyTemplatesRoute")
    @store.find('survey_template')
})

App.SurveyTemplateRoute = Ember.Route.extend({
  model: (params) ->
    console.log("in SurveyTemplateRoute")
    console.log(params)
    @store.find('survey_template', params.survey_template_id)
})

App.StepsRoute = Ember.Route.extend({
  model: ->
    console.log("in Steps Route")
    @store.find('survey_question').filterBy('step', 1)
})

App.SurveyStepRoute = Ember.Route.extend({
  model: (params) ->
    console.log("in SurveyStepRoute")
    @store.find('survey_step', params.survey_step_id)
})
