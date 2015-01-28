# For more information see: http://emberjs.com/guides/routing/

App.Router.map ()->
  @resource 'survey_step',
    path: 'survey_steps/:survey_step_id'

App.SurveyStepRoute = Ember.Route.extend({
  model: (params) ->
    console.log("in SurveyStepRoute")
    @store.find('survey_step', params.survey_step_id)
    
  # need to populate allAnswerTypes in SurveyStepsController to populate a select
  # since pulling from a different model than survey_step must do it from here
  setupController: (controller, model) ->
    @_super controller, model
    
    # this line will go away once I refactor with Adolfo for the edit question
    @controllerFor("answer_types").set "content", @store.find("answer_type")
    # this line will go away once I refactor with Adolfo for the edit question
    
    @store.find("answer_type").then (answerTypes)->
      controller.set("answerTypes", answerTypes.sortBy('name'))
    return
})