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

    // clone repeater
    $clonedRepeater = $repeater.clone(true)

    //2 increment the data-entry every click
    $dataEntry = $dataEntry + 1

    // update attributes with timestamps
    updateDom($clonedRepeater, $dataEntry )
    $('.panel-body').append($clonedRepeater)


    // remove time input form bottom and append to new extention
    var timeInput = $('div.col-sm-7 input:first-child[type=time]').last().parent().parent().parent()
    $(timeInput).remove()
    $('div.panel-body').append(timeInput)
    $('.attachinary-input').attachinary()

    // 3 removes latlong cordinated from new form
    $('input.latlong-entry').last().val("")


    // 4 shows uploaded file name
    $('input[type=file]').fileupload('option', 'replaceFileInput', false);

    // 5 bind chosen multiselect
    $(".chosen-multiselect").chosen();
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

  function updateDom($clonedRepeater, dataEntry){
    var timeStamp = new Date().getTime()
    for (var i = 0; i < $clonedRepeater.length; i++) {
      if ($($clonedRepeater[i]).attr('data-element-type') == "container") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "select") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)
        $($($clonedRepeater[i]).find('div.chosen-container')).attr("id", "survey_observations_attributes_" + timeStamp + "_answer_chosen")
      }else if ($($clonedRepeater[i]).attr('data-element-type') == 'map') {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "multiselect") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "textarea") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "file"){

        // removes  div.attachinary_container duplicate
       $($clonedRepeater[i]).find(".attachinary_container").last().remove()

       // replace file input's html with new instance
       $($clonedRepeater[i]).replaceWith($photoInput)

        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "radio"){
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "checkboxes"){
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "date") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "email") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "helper") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "number") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "line") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "static") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "text") {
        updateClonedInputs($clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels($clonedRepeater[i], timeStamp)
      }
      timeStamp  =  new Date().getTime()
    };
  };
});
