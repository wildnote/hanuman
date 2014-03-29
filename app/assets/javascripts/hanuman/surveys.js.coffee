# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  # typeahead - build answers array from answers list string
  answers_list_string = $(".typeahead").attr "data-answer-choices"
  answers_array = answers_list_string.split("||")
  
  # typeahead - instantiate the bloodhound suggestion engine
  answers = new Bloodhound(
    datumTokenizer: (d) ->
      Bloodhound.tokenizers.whitespace d.answer

    queryTokenizer: Bloodhound.tokenizers.whitespace
    local: $.map(answers_array, (answer) ->
      answer: answer
    )
  )

  # typeahead - initialize the bloodhound suggestion engine
  answers.initialize()

  # typeahead - instantiate the typeahead ui
  $(".typeahead").typeahead
    hint: true
    highlight: true
    minLength: 1
  ,
    name: "answers"
    displayKey: "answer"
    source: answers.ttAdapter()

  # chosen
  $(".chosen-select").chosen
    no_results_text: "No results matched"
    size: "100%"

  # chosen multiselect
  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"