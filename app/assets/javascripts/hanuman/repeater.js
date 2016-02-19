$(document).ready(function(){
  $dataEntry = parseInt($('div.form-container-repeater').find('.form-container-entry-item').first().attr('data-entry'))
  $fileInput = $('.attachinary-input').first().parent().parent().parent().prop('outerHTML')

  console.log($dataEntry)
  $('.duplicate').on("click", function(e){
    e.preventDefault();
    // unbind chosen select & multiselect
    $(".chosen-multiselect").chosen('destroy');
    $(".chosen-select").chosen('destroy');

    var container = $('.form-container-repeater').first();
    $clonedContainer = container.clone(true)
    var containerItems = $($clonedContainer).find('.form-container-entry-item')


    // increment data-entry by 1 every click
    $dataEntry = $dataEntry + 1

    // update attributes with timestamps
    updateDom(containerItems, $dataEntry )

    $('.form-container-repeater').last().after($clonedContainer)

    $('.attachinary-input').attachinary()

    // bind chosen select & multiselect
    $(".chosen-multiselect").chosen();
    $(".chosen-select").chosen();
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
        updateClonedTextareas(clonedRepeater[i], timeStamp)
        console.log("textarea")
        console.log(timeStamp)
        console.log(clonedRepeater[i])

      }else if ($(clonedRepeater[i]).attr('data-element-type') == "file"){
       // replace file input's html with fresh instance
      //  $(clonedRepeater[i]).replaceWith($fileInput)

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
