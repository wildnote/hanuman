App.ChosenMultiSelect = Ember.Select.extend(
  chosenOptions:
    width: "100%"
    search_contains: true
  multiple: true
  attributeBindings: ["multiple"]
  
  didInsertElement: ->
    view = this
    @_super()
    view.$().chosen view.get("chosenOptions")
    
    # Observes for new changes on options to trigger an update on Chosen, 
    # assumes optionLabelPath is something like "content.name"
    @addObserver @get("optionLabelPath").replace(/^content/, "content.@each"), ->
      @rerenderChosen()

  _closeChosen: ->
    # trigger escape to close chosen
    @$().next(".chzn-container-active").find("input").trigger
      type: "keyup"
      which: 27
    return

  rerenderChosen: ->
    @$().trigger "chosen:updated"
    return
)