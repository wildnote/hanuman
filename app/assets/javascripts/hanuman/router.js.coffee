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

# App.SurveyStepRoute = Ember.Route.extend({
#   model: (params) ->
#     console.log("in SurveyStepRoute")
#     @store.find('survey_step', params.survey_step_id)
#     
#   # need to populate allAnswerTypes in SurveyStepsController to populate a select
#   # since pulling from a different model than survey_step must do it from here
#   setupController: (controller, model) ->
#     @_super controller, model
#     @controllerFor("answer_types").set "content", @store.find("answer_type")
#     return
# })

App.SurveyStepRoute = Ember.Route.extend(
  model: (params) ->
    Ember.RSVP.hash
      survey_step: @store.find("survey_step", params.survey_step_id)
      all_answer_types: @store.find("answer_type")
  
  # Since the route hook returns a hash of (hopefully) settled promises, we
  # have to set the model property here, as well as the possible_areas property.
  setupController: (controller, model) ->
    controller.set "model", model.survey_step
    controller.set "all_answer_types", model.all_answer_types
    return
)

App.AnswerTypesRoute = Ember.Route.extend({
  model: ->
    @store.find('answer_type')
})