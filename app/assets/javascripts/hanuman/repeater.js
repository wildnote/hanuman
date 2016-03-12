$(document).ready(function(){

  // need to find the max data entry on the page and start incrementing from there
  $dataEntry = 0;
  $('.form-container-repeater').each(function() {
    if ($dataEntry < $(this).attr('data-entry')) {
      $dataEntry = parseInt($(this).attr('data-entry'));
    }
  });

  $('.form-container-survey').on("click", '.duplicate-form-container-repeater', function(e){
    e.preventDefault();
    e.stopPropagation();

    $scrollPosition = $(this).offset().top - 50;

    // unbind chosen select & multiselect
    $(".chosen-multiselect").chosen('destroy');
    $(".chosen-select").chosen('destroy');
    $(".bootstrap-checkbox-multiselect").multiselect('destroy');
    var container = $(this).closest('.form-container-repeater');
    $clonedContainer = container.clone(true);
    var containerItems = $($clonedContainer).find('.form-container-entry-item');

    // increment data-entry by 1 on every click
    $dataEntry = $dataEntry + 1;

    // update attributes with timestamps
    updateDom(containerItems, $dataEntry);

    for (var i = 0; i < containerItems.length; i++) {
      stringInput = $(containerItems[i]).prop('outerHTML');
      newInput = $.parseHTML(stringInput);
      $(containerItems[i]).replaceWith(newInput);
    }

    // fix repeater container data-entry numbers
    $clonedContainer.attr("data-entry", $dataEntry);
    $clonedContainer.find(".form-container-repeater").attr("data-entry", $dataEntry);

    // set cloned container to display none for fading in
    $clonedContainer.attr("style", "display: none;").addClass("new-clone");

    $(container).after($clonedContainer);

    $newClone = $(".new-clone");

    $newClone.delay("100").fadeIn(1000).removeClass("new-clone");

    setTimeout(function() {
      $("html, body").animate({
        scrollTop: $scrollPosition
      }, 500);
    }, 200);

    clearValues($(container).nextAll(".form-container-repeater").find('.form-container-entry-item'));
    // bind chosen select, multiselect, and attachinary
    $('.attachinary-input').attachinary();
    $(".chosen-multiselect").chosen();
    $(".chosen-select").chosen();
    $(".bootstrap-checkbox-multiselect").multiselect();
    // bind maps
    setupDefaultMaps();
    bindButtons();

    // bind ConditionalLogic
    cl = new ConditionalLogic;
    cl.findRules();
  });

  $('.form-container-survey').on('click', ".destroy-form-container-repeater", function(){
    var entry = $($(this).closest('.form-container-repeater')).attr('data-entry');
    var dataObservationId = $($(this).closest('.form-container-repeater')).attr('data-observation-id');
    $(".form-entry-item-container[data-entry=" + entry + "]").not('.form-entry-item-container[data-element-type=time]').remove();
    $removeContainer = $(this).closest('.form-container-repeater');

    setTimeout(function() {
      $("html, body").animate({
        scrollTop: $removeContainer.offset().top - 500
      }, 1000);
    }, 200);

    $removeContainer.fadeOut(
      2000,
      function() {
          $removeContainer.remove();
      }
    );

    if (window.location.pathname.match(/\/projects\/[\d+]\/hanuman\/surveys\/\d+\/edit/)) {
      var projectId = window.location.pathname.match(/\/projects\/(\d+)/)[1];
      var surveyId = window.location.pathname.match(/\/surveys\/(\d+)/)[1];

      $.ajax({
        url: "/projects/" + projectId + "/hanuman/surveys/" + surveyId + "/repeater_observation/" + dataObservationId + "/entry/"+ entry,
        method: "Delete"
      });
    }

    return false;
  });

  function updateClonedInputs($clonedRepeater, dataEntry, timeStamp){
    $($clonedRepeater).attr('data-entry', dataEntry);
    var inputs = $($clonedRepeater).find('input');
    var lastInputIndex = inputs.length - 1;
    var index = 0;
    $(inputs[lastInputIndex]).attr("value", dataEntry);
    inputs.each(function(){
      if ($(inputs[index]).attr('id')) {
        var idStamp = $(inputs[index]).attr("id").match(/\d+/)[0];
        var newTimeStamp = idStamp.concat(timeStamp);
        $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/\d+/, newTimeStamp));
      }
      if ($(inputs[index]).attr('name')) {
        var nameStamp = $(inputs[index]).attr("name").match(/\d+/)[0];
        var newTimeStamp = nameStamp.concat(timeStamp);
        $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/\d+/, newTimeStamp));
      }
      index ++;
    });
  }

  function updateClonedSelects($clonedRepeater, timeStamp){
    var select = $($clonedRepeater).find('select');
    var index = 0;
    select.each(function(){
      if ($(select[index]).attr('id')) {
        var idStamp = $(select[index]).attr("id").match(/\d+/)[0];
        var newTimeStamp = idStamp.concat(timeStamp);
        $(select[index]).attr("id", $(select[index]).attr("id").replace(/(\d+)/, newTimeStamp));
      }
      if ($(select[index]).attr('name')) {
        var nameStamp = $(select[index]).attr("name").match(/\d+/)[0];
        var newTimeStamp = nameStamp.concat(timeStamp);
        $(select[index]).attr("name", $(select[index]).attr("name").replace(/(\d+)/, newTimeStamp));
      }
      index ++;
    });
  }

  function updateClonedLabels($clonedRepeater, timeStamp){
    var labels = $($clonedRepeater).find('label');
    var index = 0;
    labels.each(function(){
      if ($(labels[index]).attr("for")) {
        var forStamp = $(labels[index]).attr("for").match(/\d+/)[0];
        var newTimeStamp = forStamp.concat(timeStamp);
        $(labels[index]).attr("for", $(labels[index]).attr("for").replace(/(\d+)/, newTimeStamp));
      }
      index ++
    });
  }

  function updateClonedTextareas($clonedRepeater, timeStamp){
    var textareas = $($clonedRepeater).find('textarea');
    var index = 0;
    textareas.each(function(){
      if ($(textareas[index]).attr('id')) {
        var idStamp = $(textareas[index]).attr("id").match(/\d+/)[0];
        var newTimeStamp = idStamp.concat(timeStamp);
        $(textareas[index]).attr("id", $(textareas[index]).attr("id").replace(/(\d+)/, newTimeStamp));
      }
      if ($(textareas[index]).attr('name')) {
        var nameStamp = $(textareas[index]).attr("name").match(/\d+/)[0];
        var newTimeStamp = nameStamp.concat(timeStamp);
        $(textareas[index]).attr("name", $(textareas[index]).attr("name").replace(/(\d+)/, newTimeStamp));
      }
      $(textareas[index]).val("");
      index ++;
    });
  }

  function updateDom(clonedRepeater, dataEntry){
    var timeStamp = new Date().getTime();
    for (var i = 0; i < clonedRepeater.length; i++) {
      $($(clonedRepeater[i]).find('.latlong')).attr('id', "map".concat(timeStamp));
      updateClonedInputs(clonedRepeater[i], dataEntry, timeStamp);
      updateClonedLabels(clonedRepeater[i], timeStamp);
      updateClonedSelects(clonedRepeater[i], timeStamp);
      updateClonedTextareas(clonedRepeater[i], timeStamp);
      $($(clonedRepeater[i]).find('.chosen-container')).attr("id", "survey_observations_attributes_" + timeStamp + "_answer_chosen");
      timeStamp = new Date().getTime();
    };
  };

  function clearValues(clonedRepeater){
    for (var i = 0; i < clonedRepeater.length; i++) {
      // $(clonedRepeater[i]).find("input[type!=hidden]").val("");
      textFields = $(clonedRepeater[i]).find(":text").val("");
      textAreas = $(clonedRepeater[i]).find("textarea").val("");
      // un-select dropdown
      selects = $(clonedRepeater[i]).find("select");
      $(selects).each(function() {
        $(this).val("");
        // if we don't add please select at this point the dropdown will show blank with no prompt
        if ($(this).find('option:contains("Please select")').length < 1) {
          $(this).prepend("<option value>Please select</option>");
        }
        if ($(this).hasClass('chosen')) {
          $(this).trigger("chosen:updated");
        }
      });
      multiselects = $(clonedRepeater[i]).find("select[multiple]");
      $(multiselects).each(function() {
        $('#' + $(this).attr('id') + ' option:selected').removeAttr("selected");
        if ($(this).hasClass('chosen-multiselect')) {
          $(this).trigger("chosen:updated");
        }
      });
      // uncheck all checkboxes
      checkboxes = $(clonedRepeater[i]).find(":checkbox");
      $(checkboxes).each(function() {
        $(this).prop('checked', false);
        });
      // un-select radio buttons
      radiobuttons = $(clonedRepeater[i]).find(":radio");
      $(radiobuttons).each(function() {
        $(this).prop('checked', false);
      });
      // trigger onchange event which is needed for embedded conditional logic
      $(clonedRepeater[i]).find('.form-control').trigger('change');
    };
  };
});
