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


  # setup enabling and disabling of wetland calculated fields
  if $('.form-container-survey').length > 0
    $manuallyCalcDominanceWorksheet = $('.form-container-survey').find("[data-api-column-name ='manually_calculate_dominance_test_worksheet']").find('input:checkbox:first')
    $manuallyCalcPrevalenceWorksheet = $('.form-container-survey').find("[data-api-column-name ='manually_calculate_prevalence_index_worksheet']").find('input:checkbox:first')

    # loop through all the potential manually_set_indicator_status in each veg repeater
    i = 0
    while i < 6
      j = i + 1
      manuallySetIndicatorStatusString = "[data-api-column-name ='manually_set_indicator_status_" + j + "']"
      $manuallySetIndicatorStatus = $('.form-container-survey').find(manuallySetIndicatorStatusString)
      $manuallySetIndicatorCB = $manuallySetIndicatorStatus.find('input:checkbox:first')
      $manuallySetIndicatorCB.on "click", ->
        # if checked re-enable indicator status in same repeater
        if $(this).is(":checked")
          $(this).parents('.form-container-entry-item').prev().find('.chosen-container').css({'pointer-events': 'auto','opacity': 1})
        else
          $(this).parents('.form-container-entry-item').prev().find('.chosen-container').css({'pointer-events': 'none','opacity': .5})
      i++

    # found manually_set_indicator_status without an _X so finding that one too
    $manuallySetIndicatorCB = $('.form-container-survey').find("[data-api-column-name ='manually_set_indicator_status']").find('input:checkbox:first')
    $manuallySetIndicatorCB.on "click", ->
      # if checked re-enable indicator status in same repeater
      if $(this).is(":checked")
        $(this).parents('.form-container-entry-item').prev().find('.chosen-container').css({'pointer-events': 'auto','opacity': 1})
      else
        $(this).parents('.form-container-entry-item').prev().find('.chosen-container').css({'pointer-events': 'none','opacity': .5})
    i++

    $manuallyCalcDominanceWorksheet.on "click", ->
      if $(this).is(":checked")
        $(this).parents('.form-container-entry-item').nextAll().each ->
          console.log $(this).find('.form-control')
          $(this).find('.form-control').attr('readonly', false);
      else
        $(this).parents('.form-container-entry-item').nextAll().each ->
          $(this).find('.form-control').attr('readonly', true);

    $manuallyCalcPrevalenceWorksheet.on "click", ->
      if $(this).is(":checked")
        $(this).parents('.form-container-entry-item').nextAll().each ->
          console.log $(this).find('.form-control')
          $(this).find('.form-control').attr('readonly', false);
      else
        $(this).parents('.form-container-entry-item').nextAll().each ->
          $(this).find('.form-control').attr('readonly', true);
