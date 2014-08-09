# For more information see: http://emberjs.com/guides/routing/

Hanuman.Router.map ()->
  # @resource('posts')
  @resource 'survey_templates'

Hanuman.IndexRoute = Ember.Route.extend(
  model: ->
    return ['red', 'yellow', 'blue']
)
