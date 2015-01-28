Ember.Handlebars.helper "upcase", (value, options) ->
  return value.toUpperCase()

Ember.Handlebars.helper 'titleize', (text) ->
  text.titleize()
  
String::titleize = ->
  @underscore().replace(/_/g, " ").capitalize()