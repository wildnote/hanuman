# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  # typeahead
  # instantiate the bloodhound suggestion engine
  colors = new Bloodhound(
    datumTokenizer: (d) ->
      Bloodhound.tokenizers.whitespace d.color

    queryTokenizer: Bloodhound.tokenizers.whitespace
    local: [
      {
        color: "white"
      }
      {
        color: "red"
      }
      {
        color: "blue"
      }
      {
        color: "green"
      }
      {
        color: "yellow"
      }
      {
        color: "brown"
      }
      {
        color: "black"
      }
    ]
  )

  # initialize the bloodhound suggestion engine
  colors.initialize()

  # instantiate the typeahead UI
  $(".typeahead").typeahead null,
    displayKey: "color"
    source: colors.ttAdapter()

  # chosen
  $(".chosen-select").chosen
    no_results_text: "No results matched"
    size: "100%"

  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"