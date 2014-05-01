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
    limit: 10
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

  # ajax update from step_2
  $('.ajax-submit').click (e) ->
    e.preventDefault()
    $form = $('form')
    survey_id = $('#survey_id').val()

    $.ajax(
      type:     "PUT"
      url:      "/hanuman/surveys/" + survey_id,
      data:     $form.serialize(),
      dataType: "json",
      success: (response) ->
        # add observation to end of observation section
        newRow = HandlebarsTemplates['hanuman/templates/survey/observation'](response[0])
        $lastRow = $('.form-group')[$('.form-group').size() - 3]
        $(newRow).insertAfter( $lastRow )

        # clear out observation field
        $('#survey_observations_attributes_0_answer').val("")

        # increment group value
        $group = $('#survey_observations_attributes_0_group')
        groupVal = parseInt $group.val()
        $group.val(groupVal + 1)

    ).fail (jqXHR, textStatus, errorThrown) ->
        #$this.trigger("kitfox.returnFromAjaxCall")
        #$form.find(".alert").last().text(window.ProjectAdmin.parseErrors(jqXHR.responseText)).show()
        #$('#loading-container').hide('slow')
        #$('#loading-opposite').show('slow')
