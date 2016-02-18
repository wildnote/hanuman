$(document).ready(function(){
  $dataEntry = parseInt($('.panel-body div:nth-child(4)').attr('data-entry'))
  $photoInput = $('.attachinary-input:first-child').parent().parent().parent().prop('outerHTML')

  $('.duplicate').each(function(){
    $target = $(this);
    $container = $target.closest('.form-container-entry-item');
    questionId = $container.attr('data-question-id');
    entryId = $container.attr('data-entry');
    $repeater = $("[data-question-id=" + questionId + "][data-entry=" + entryId + "],[data-ancestor=" + questionId + "][data-entry=" + entryId + "]");

    $repeater.attr("style", "background-color: #EFF;");
  });

  $('.duplicate').on("click", function(e){

    e.preventDefault();
    $target = $(event.target);
    $container = $target.closest('.form-container-entry-item');
    questionId = $container.attr('data-question-id');
    entryId = $container.attr('data-entry');

    $repeater = $("[data-question-id=" + questionId + "][data-entry=" + $('.panel-body div:nth-child(4)').attr('data-entry') + "],[data-ancestor=" + questionId + "][data-entry=" + $('.panel-body div:nth-child(4)').attr('data-entry') + "]");

    // $repeater = $("[data-question-id=" + questionId + "][data-entry=" + entryId + "],[data-ancestor=" + questionId + "][data-entry=" + entryId + "]");

    $repeater.attr("style", "background-color: #EFF;");


    // 5 bind chosen select & multiselect
    $(".chosen-multiselect").chosen('destroy')
    $(".chosen-select").chosen('destroy')

    // cloning repeater
    $clonedRepeater = $repeater.clone(true)

    //2 increment data-entry by 1 every click
    $dataEntry = $dataEntry + 1

    // update attributes with timestamps
    updateDom($clonedRepeater, $dataEntry )
    $('.panel-body').append($clonedRepeater)


    // remove time input from bottom and append to new extention
    // var timeInput = $('div.col-sm-7 input:first-child[type=time]').last().parent().parent().parent()
    // $(timeInput).remove()
    // $('div.panel-body').append(timeInput)

    $('.attachinary-input').attachinary()


    // 5 bind chosen select & multiselect
    $(".chosen-multiselect").chosen();
    $(".chosen-select").chosen();

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
        $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/\d+/, timeStamp))
      }
      if ($(inputs[index]).attr('name')) {
        $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/\d+/, timeStamp))
      }
      index ++
    });
  }

  function updateClonedSelects($clonedRepeater, timeStamp){
    var select = $($clonedRepeater).find('select')
    var index = 0
    select.each(function(){
      if ($(select[index]).attr('id')) {
        $(select[index]).attr("id", $(select[index]).attr("id").replace(/(\d+)/, timeStamp))
      }
      if ($(select[index]).attr('name')) {
        $(select[index]).attr("name", $(select[index]).attr("name").replace(/(\d+)/, timeStamp))
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
        $(labels[index]).attr("for", attr.replace(/(\d+)/, timeStamp))
      }
      index ++
    });
  }
  function updateClonedTextareas($clonedRepeater, timeStamp){
    var textareas = $($clonedRepeater).find('textarea')
    var index = 0
    textareas.each(function(){
      if ($(textareas[index]).attr('id')) {
        $(textareas[index]).attr("id", $(textareas[index]).attr("id").replace(/(\d+)/, timeStamp))
      }
      if ($(textareas[index]).attr('name')) {
        $(textareas[index]).attr("name", $(textareas[index]).attr("name").replace(/(\d+)/, timeStamp))
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
        console.log("container")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "select") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedSelects(clonedRepeater[i], timeStamp)
        console.log("select")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
        $($(clonedRepeater[i]).find('div.chosen-container')).attr("id", "survey_observations_attributes_" + timeStamp + "_answer_chosen")
      }else if ($(clonedRepeater[i]).attr('data-element-type') == 'map') {
        $($(clonedRepeater[i]).find('.col-sm-12.latlong')).attr('id', timeStamp)
        $(clonedRepeater[i]).find('input.latlong-entry').val("");
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("map")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "multiselect") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedSelects(clonedRepeater[i], timeStamp)
        console.log("multiselect")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "textarea") {
        $(clonedRepeater[i]).find('input[type=textarea]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedTextareas($clonedRepeater[i], timeStamp)
        console.log("textarea")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "file"){

        // removes  div.attachinary_container duplicate
       $(clonedRepeater[i]).find(".attachinary_container").last().remove()

       // replace file input's html with new instance
       $(clonedRepeater[i]).replaceWith($photoInput)

        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("file")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "radio"){
        $(clonedRepeater[i]).find('input[type=radio]').prop('checked', false);
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("radio")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "checkboxes"){
        $(clonedRepeater[i]).find('input[type=checkbox]:checked').removeAttr('checked')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("checkboxes")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "date") {
        $(clonedRepeater[i]).find('[type=date]').last().val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("date")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "email") {
        $(clonedRepeater[i]).find('input[type=email]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("email")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "helper") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "number") {
        $(clonedRepeater[i]).find('input[type=number]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("number")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "line") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        console.log("line")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "static") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        console.log("static")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "text") {
        $(clonedRepeater[i]).find('input[type=text]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        console.log("text")
        console.log(timeStamp)
        console.log(clonedRepeater[i])
      }
      timeStamp  =  new Date().getTime()
    };
  };
});
