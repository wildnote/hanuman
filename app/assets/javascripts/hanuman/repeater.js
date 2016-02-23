$(document).ready(function(){
  $dataEntry = parseInt($('div.form-container-repeater').find('.form-container-entry-item').first().attr('data-entry'))
  $('.panel-body').on("click", '.duplicate-form-container-repeater', function(e){
    e.preventDefault();
    e.stopPropagation();

    // unbind chosen select & multiselect
    $(".chosen-multiselect").chosen('destroy');
    $(".chosen-select").chosen('destroy');
    $(".bootstrap-checkbox-multiselect").multiselect('destroy')
    var container = $(this).closest('.form-container-repeater');
    $clonedContainer = container.clone(true)
    var containerItems = $($clonedContainer).find('.form-container-entry-item')

    // increment data-entry by 1 on every click
    $dataEntry = $dataEntry + 1

    // update attributes with timestamps
    updateDom(containerItems, $dataEntry)

    for (var i = 0; i < containerItems.length; i++) {
      stringInput = $(containerItems[i]).prop('outerHTML')
      newInput = $.parseHTML(stringInput)
      $(containerItems[i]).replaceWith(newInput)
    }

    $(container).after($clonedContainer)
    // bind chosen select, multiselect, and attachinary
    $('.attachinary-input').attachinary()
    $(".chosen-multiselect").chosen();
    $(".chosen-select").chosen();
    $(".bootstrap-checkbox-multiselect").multiselect()
    // bind maps
    setupDefaultMaps()
    bindButtons()
  });

  $('div.panel-body').on('click', ".destroy-form-container-repeater", function(){
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
        var idStamp = $(inputs[index]).attr("id").match(/\d+/)[0]
        var newTimeStamp = idStamp.concat(timeStamp)
        $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/\d+/, newTimeStamp))
      }
      if ($(inputs[index]).attr('name')) {
        var nameStamp = $(inputs[index]).attr("name").match(/\d+/)[0]
        var newTimeStamp = nameStamp.concat(timeStamp)
        $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/\d+/, newTimeStamp))
      }
      index ++
    });
  }

  function updateClonedSelects($clonedRepeater, timeStamp){
    var select = $($clonedRepeater).find('select')
    var index = 0
    select.each(function(){
      if ($(select[index]).attr('id')) {
        var idStamp = $(select[index]).attr("id").match(/\d+/)[0]
        var newTimeStamp = idStamp.concat(timeStamp)
        $(select[index]).attr("id", $(select[index]).attr("id").replace(/(\d+)/, newTimeStamp))
      }
      if ($(select[index]).attr('name')) {
        var nameStamp = $(select[index]).attr("name").match(/\d+/)[0]
        var newTimeStamp = nameStamp.concat(timeStamp)
        $(select[index]).attr("name", $(select[index]).attr("name").replace(/(\d+)/, newTimeStamp))
      }
      index ++
    });
  }

  function updateClonedLabels($clonedRepeater, timeStamp){
    var labels = $($clonedRepeater).find('label')
    var index = 0
    labels.each(function(){
      if ($(labels[index]).attr("for")) {
        var forStamp = $(labels[index]).attr("for").match(/\d+/)[0]
        var newTimeStamp = forStamp.concat(timeStamp)
        $(labels[index]).attr("for", $(labels[index]).attr("for").replace(/(\d+)/, newTimeStamp))
      }
      index ++
    });
  }

  function updateClonedTextareas($clonedRepeater, timeStamp){
    var textareas = $($clonedRepeater).find('textarea')
    var index = 0
    textareas.each(function(){
      if ($(textareas[index]).attr('id')) {
        var idStamp = $(textareas[index]).attr("id").match(/\d+/)[0]
        var newTimeStamp = idStamp.concat(timeStamp)
        $(textareas[index]).attr("id", $(textareas[index]).attr("id").replace(/(\d+)/, newTimeStamp))
      }
      if ($(textareas[index]).attr('name')) {
        var nameStamp = $(textareas[index]).attr("name").match(/\d+/)[0]
        var newTimeStamp = nameStamp.concat(timeStamp)
        $(textareas[index]).attr("name", $(textareas[index]).attr("name").replace(/(\d+)/, newTimeStamp))
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
        $($(clonedRepeater[i]).find('.latlong')).attr('id', "map".concat(timeStamp))
        $(clonedRepeater[i]).find('input.latlong-entry').val("");
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "multiselect") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedSelects(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "textarea") {
        $(clonedRepeater[i]).find('input[type=textarea]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)
        updateClonedTextareas(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "file"){
        $($(clonedRepeater[i]).find('div.attachinary_container')).remove()
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "radio"){
        $(clonedRepeater[i]).find('input[type=radio]').prop('checked', false);
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "checkboxes"){
        $(clonedRepeater[i]).find('input[type=checkbox]:checked').removeAttr('checked')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "date") {
        $(clonedRepeater[i]).find('[type=date]').last().val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "email") {
        $(clonedRepeater[i]).find('input[type=email]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "helper") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
      }else if ($(clonedRepeater[i]).attr('data-element-type') == "number") {
        $(clonedRepeater[i]).find('input[type=number]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)



      }else if ($(clonedRepeater[i]).attr('data-element-type') == "line") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "static") {
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "text") {
        $(clonedRepeater[i]).find('input[type=text]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)


      }else if ($(clonedRepeater[i]).attr('data-element-type') == "time") {
        $(clonedRepeater[i]).find('input[type=time]').val('')
        updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp)
        updateClonedLabels(clonedRepeater[i], timeStamp)


      }
      timeStamp  =  new Date().getTime()
    };
  };
});
