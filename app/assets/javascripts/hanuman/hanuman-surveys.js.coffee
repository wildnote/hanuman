$ ->
  if $(".panel-observation").length > 0
    $(".panel-observation").each( (index, element) ->
        question_id = $(element).attr('data-question-id');
        $(element).find('.panel-heading.chevron').attr("data-target", "#collapse_" + question_id + "_" + (index + 1))
        $(element).find('.panel-collapse.in').attr("id", "collapse_" + question_id + "_" + (index + 1))
      )


  # CHOSEN SINGLE SELECT
  # $(".chosen-select").prepend("<option value=''>&nbsp;</option>");
  $(".chosen-select").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"
    single_backstroke_delete: false
    search_contains: true



  # CHOSEN MULTISELECT
  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"
    single_backstroke_delete: false
    search_contains: true

  # END CHOSEN

  # Disable calculated fields
  $('.chosen-multiselect[readonly], .chosen-select[readonly]').parent().find('.chosen-container').css({'pointer-events': 'none','opacity': 0.5});
