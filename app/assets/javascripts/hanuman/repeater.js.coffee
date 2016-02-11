$ ->
  $('.duplicate').on "click", (e) ->
    e.preventDefault()
    $target = $(event.target)
    $container = $target.closest('.form-entry-item-container')
    questionId = $container.attr('data-question-id')
    entryId = $container.attr('data-entry')
    $repeater = $("[data-question-id=" + questionId + "][data-entry=" + entryId + "],[data-ancestor=" + questionId + "][data-entry=" + entryId + "]")
    stringified = $repeater.prop('outerHTML')
    $repeater.each ->
      console.log $(this).prop('outerHTML')
    #console.log $repeater
