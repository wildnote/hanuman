App.RadioButton = Ember.View.extend
  tagName: "input"
  type: "radio"
  attributeBindings: [
    "name"
    "type"
    "value"
    "checked:checked:"
  ]

  click: ->
    @set "selection", @$().val()
    return

  checked: (->
    typeof @get('selection') != 'undefined' && @get("value").toString() == @get("selection").toString()
  ).property()

  updateChecked: (->
    @$().prop('checked', @get("selection") == @get("value"))
  ).observes('selection')