#
#  DS.attr('object')
#
App.ObjectTransform = DS.Transform.extend(
  deserialize: (value) ->
    unless $.isPlainObject(value)
      {}
    else
      value

  serialize: (value) ->
    unless $.isPlainObject(value)
      {}
    else
      value
)

#
#  DS.attr('array')
#
App.ArrayTransform = DS.Transform.extend(
  deserialize: (value) ->
    if Ember.isArray(value)
      Em.A value
    else
      Em.A()

  serialize: (value) ->
    if Ember.isArray(value)
      Em.A value
    else
      Em.A()
)