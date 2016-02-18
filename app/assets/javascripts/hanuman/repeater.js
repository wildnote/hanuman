$(document).ready(function(){
  $dataEntry = parseInt($('.panel-body div:nth-child(4)').attr('data-entry'))
  $photoInput = $('.attachinary-input:first-child').parent().parent().parent().prop('outerHTML')

  $('.duplicate').on("click", function(e){
    e.preventDefault();
    $target = $(event.target);
    $container = $target.closest('.form-entry-item-container');
    questionId = $container.attr('data-question-id');
    entryId = $container.attr('data-entry');
    $repeater = $("[data-question-id=" + questionId + "][data-entry=" + entryId + "],[data-ancestor=" + questionId + "][data-entry=" + entryId + "]");


    //1 remove "chosen" form  div.chosen-multiselect
    $(".chosen-multiselect").chosen('destroy')

    // cloning repeater
    $clonedRepeater = $repeater.clone(true)

    //2 increment data-entry by 1 every click
    $dataEntry = $dataEntry + 1

    // update attributes with timestamps
    updateDom($clonedRepeater, $dataEntry )
    $('.panel-body').append($clonedRepeater)


    // remove time input form bottom and append to new extention
    var timeInput = $('div.col-sm-7 input:first-child[type=time]').last().parent().parent().parent()
    $(timeInput).remove()
    $('div.panel-body').append(timeInput)

    //
    $('.attachinary-input').attachinary()

    // 3 removes latlong cordinates from new form
    $('input.latlong-entry').last().val("")


    // 4 shows uploaded file name
    // $('input[type=file]').fileupload('option', 'replaceFileInput', false);

    // 5 bind chosen multiselect
    $(".chosen-multiselect").chosen();

    // adds a link to remove repeator section
  });

  $('div.panel-body').on('click', "a.destroy", function(){
    var entry = $($(this).closest('div.form-entry-item-container')).attr('data-entry')
    var dataObservationId = $($(this).closest('div.form-entry-item-container')).attr('data-observation-id')
    $("div.form-entry-item-container[data-entry=" + entry + "]").not('div.form-entry-item-container[data-element-type=time]').remove()

    if (window.location.pathname.match(/\/projects\/[\d+]\/hanuman\/surveys\/\d+\/edit/)) {
      var projectId = window.location.pathname.match(/\/projects\/(\d+)/)[1]
      var surveyId = window.location.pathname.match(/\/surveys\/(\d+)/)[1]

      $.ajax({
        url: "/projects/" + projectId + "/hanuman/surveys/" + surveyId + "/repeater_observation/" + dataObservationId + "/entry/"+ entry,
        method: "Delete"
      })
    }
  });


  function updateClonedInputs($clonedRepeater, dataEntry, timeStamp){
    $($clonedRepeater).attr('data-entry', dataEntry);
    var inputs = $($clonedRepeater).find('input')
    var lastInputIndex = inputs.length - 1
    var index = 0
    $(inputs[lastInputIndex]).attr("value", dataEntry)
    inputs.each(function(){
      if ($(inputs[index]).attr('id')) {
        $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
      }
      if ($(inputs[index]).attr('name')) {
        $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
      }
      index ++
    });
  }

  function updateClonedSelects($clonedRepeater, timeStamp){
    var select = $($clonedRepeater).find('select')
    var index = 0
    select.each(function(){
      if ($(select[index]).attr('id')) {
        $(select[index]).attr("id", $(select[index]).attr("id").replace(/[\d+]/, timeStamp))
      }
      if ($(select[index]).attr('name')) {
        $(select[index]).attr("name", $(select[index]).attr("name").replace(/[\d+]/, timeStamp))
      }
      index ++
    });
  }

  function updateClonedLabels($clonedRepeater, timeStamp){
    var labels = $($clonedRepeater).find('label')
    var index = 0
    labels.each(function(){
      if ($(labels[index]).attr("for")) {
        var attr = $(labels[index]).attr("for")
        $(labels[index]).attr("for", attr.replace(/[\d+]/, timeStamp))
      }
      index ++
    });
  }
  function updateClonedTextareas($clonedRepeater, timeStamp){
    var textareas = $($clonedRepeater).find('textarea')
    var index = 0
    textareas.each(function(){
      if ($(textareas[index]).attr('id')) {
        $(textareas[index]).attr("id", $(textareas[index]).attr("id").replace(/[\d+]/, timeStamp))
      }
      if ($(textareas[index]).attr('name')) {
        $(textareas[index]).attr("name", $(textareas[index]).attr("name").replace(/[\d+]/, timeStamp))
      }
      $(textareas[index]).val("")
      index ++
    });
  }

  function updateDom(clonedRepeater, dataEntry){
    var timeStamp = new Date().getTime()
    for (var i = 0; i < clonedRepeater.length; i++) {
      if ($(clonedRepeater[i]).attr('data-element-type') == "container") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "select") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedSelects(clonedRepeater[i], timeStamp)
        $($(clonedRepeater[i]).find('div.chosen-container')).attr("id", "survey_observations_attributes_" + timeStamp + "_answer_chosen")
      }else if ($(clonedRepeater[i]).attr('data-element-type') == 'map') {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "multiselect") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedSelects(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "textarea") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedTextareas($clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "file"){

        // removes  div.attachinary_container duplicate
       $(clonedRepeater[i]).find(".attachinary_container").last().remove()

       // replace file input's html with new instance
       $(clonedRepeater[i]).replaceWith($photoInput)

        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "radio"){
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "checkboxes"){
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "date") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "email") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "helper") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "number") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "line") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "static") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "text") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
      }
      timeStamp  =  new Date().getTime()
    };
  };
});
