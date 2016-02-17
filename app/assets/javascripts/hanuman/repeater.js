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


  function updateDom($clonedRepeater, dataEntry){
    var timeStamp = new Date().getTime()
    for (var i = 0; i < $clonedRepeater.length; i++) {
      if ($($clonedRepeater[i]).attr('data-element-type') == "container") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($clonedRepeater[i]).find('input:first-child').attr('id', "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeater[i]).find('input:first-child').attr('name', "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($clonedRepeater[i]).find('input:first-child').attr('value', dataEntry);

        $($clonedRepeater[i]).find('input:nth-child(2)').attr('id',"survey_observations_attributes_" + timeStamp + "_entry")
        $($clonedRepeater[i]).find('input:nth-child(2)').attr('name',"survey[observations_attributes][" + timeStamp + "][entry]")

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "select") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);

        // inputs
        $($clonedRepeater[i]).find('input:first-child').attr('id',"survey_observations_attributes_" + timeStamp + "_question_id")
        $($clonedRepeater[i]).find('input:first-child').attr('name',"survey[observations_attributes][" + timeStamp + "][question_id]")
        $($clonedRepeater[i]).find('input:nth-child(2)').attr('id',"survey_observations_attributes_" + timeStamp + "_selectable_type")
        $($clonedRepeater[i]).find('input:nth-child(2)').attr('name',"survey[observations_attributes][" + timeStamp + "][selectable_type]")
        $($clonedRepeater[i]).find('input:nth-child(3)').attr('id',"survey_observations_attributes_" + timeStamp + "_entry")
        $($clonedRepeater[i]).find('input:nth-child(3)').attr('name',"survey[observations_attributes][" + timeStamp + "][entry]")
        $($clonedRepeater[i]).find('input:nth-child(3)').attr('value', dataEntry)
        // labels
        $($clonedRepeater[i]).find('label').attr("for", "survey_observations_attributes_" + timeStamp + "_answer")

        // select
        $($clonedRepeater[i]).find('select:nth-child(1)').attr("id", "survey_observations_attributes_" + timeStamp + "_selectable_id")
        $($clonedRepeater[i]).find('select:nth-child(1)').attr("name", "survey[observations_attributes][" + timeStamp + "][selectable_id]")
      }else if ($($clonedRepeater[i]).attr('data-element-type') == 'map') {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($clonedRepeater[i]).find('input:first-child').attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeater[i]).find('input:first-child').attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("value", dataEntry);
        //  labels
        $($clonedRepeater[i]).find('label:nth-child(4)').attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "multiselect") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);

        // remove chosen div(unbind cloned multiselect)
        $($clonedRepeater[i]).find("div.chosen-container").remove()

        // inputs
        $($clonedRepeater[i]).find('input:first-child').attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeater[i]).find('input:first-child').attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("id", "survey_observations_attributes_" + timeStamp + "_entry")
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("name", "survey[observations_attributes][" + timeStamp + "][entry]")
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($clonedRepeater[i]).find('input:nth-child(3)').attr("value", dataEntry);
        //selects
        $($($clonedRepeater[i]).find('select')).attr('id', "survey_observations_attributes_" + timeStamp + "_taxon_ids_");
        $($($clonedRepeater[i]).find('select')).attr('name', "survey[observations_attributes][" + timeStamp + "][taxon_ids][]");
        $($($clonedRepeater[i]).find('select')).attr('data-parsley-multiple', "survey[observations_attributes][" + timeStamp + "][taxon_ids][]");
        // labels
        $($($clonedRepeater[i]).find('label')).attr('for', "survey_observations_attributes_" + timeStamp + "_answer");

        // div id
        $($($clonedRepeater[i]).find('.chosen-container-multi')).attr('id', "survey_observations_attributes_" + timeStamp + "_taxon_ids__chosen")
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "textarea") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($clonedRepeater[i]).find('input:first-child').attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeater[i]).find('input:first-child').attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("value", dataEntry);
        // textareas
        $($clonedRepeater[i]).find('textarea:first-child').attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($clonedRepeater[i]).find('textarea:first-child').attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        // labels
        $($($clonedRepeater[i]).find('label').first()).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "file"){
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        if ($($($clonedRepeater[i]).find('input')[1]).attr('name').includes('photos')) {

          $($clonedRepeater[i]).attr('data-entry', dataEntry);

          // removes  div.attachinary_container duplicate
          $($clonedRepeater[i]).find(".attachinary_container").last().remove()

          // replace file input's html with new instance
          $($clonedRepeater[i]).replaceWith($photoInput)

          // inputs
          $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
          $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
          $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_photos");
          $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][photos][]");
          $($($clonedRepeater[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
          $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
          $($($clonedRepeater[i]).find('input')[2]).attr("value", dataEntry)

          // label
          $($clonedRepeater[i]).find('label:first-child').attr("for", "survey_observations_attributes_" + timeStamp + "_answer");
        } else if ($($($clonedRepeater[5]).find('input')[1]).attr('name').includes('videos')) {
          $($clonedRepeater[i]).attr('data-entry', dataEntry);

          // removes  div.attachinary_container duplicate
          $($clonedRepeater[i]).find(".attachinary_container").last().remove()

          // replace file input's html with new instance
          $($clonedRepeater[i]).replaceWith($photoInput)

          // inputs
          $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
          $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
          $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_videos");
          $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][videos][]");
          $($($clonedRepeater[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
          $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
          $($($clonedRepeater[i]).find('input')[2]).attr("value", dataEntry)
        }else if ($($($clonedRepeater[5]).find('input')[1]).attr('name').includes('documents')) {
          $($clonedRepeater[i]).attr('data-entry', dataEntry);

          // removes  div.attachinary_container duplicate
          $($clonedRepeater[i]).find(".attachinary_container").last().remove()

          // replace file input's html with new instance
          $($clonedRepeater[i]).replaceWith($photoInput)

          // inputs
          $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
          $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
          $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_documents");
          $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][documents][]");
          $($($clonedRepeater[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
          $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
          $($($clonedRepeater[i]).find('input')[2]).attr("value", dataEntry)
        }
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "radio"){
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeater[i]).find('input')[0]).attr('id',"survey_observations_attributes_" + timeStamp + "_question_id")
        $($($clonedRepeater[i]).find('input')[0]).attr('name',"survey[observations_attributes][" + timeStamp + "][question_id]")
        $($($clonedRepeater[i]).find('input')[1]).attr('id', "survey_observations_attributes_" + timeStamp + "_answer_a")
        $($($clonedRepeater[i]).find('input')[1]).attr('name', "survey[observations_attributes][" + timeStamp + "][answer]")
        $($($clonedRepeater[i]).find('input')[2]).attr('id',"survey_observations_attributes_" + timeStamp + "_answer_b")
        $($($clonedRepeater[i]).find('input')[2]).attr('name', "survey[observations_attributes][" + timeStamp + "][answer]")
        $($($clonedRepeater[i]).find('input')[3]).attr('id', "survey_observations_attributes_" + timeStamp + "_entry")
        $($($clonedRepeater[i]).find('input')[3]).attr('name', "survey[observations_attributes][" + timeStamp + "][entry]")
        $($($clonedRepeater[i]).find('input')[3]).attr('value', dataEntry)


        // labels
        $($($clonedRepeater[i]).find('label')[0]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer")

        // radio button labels
        var labels = $($clonedRepeater[i]).find('label')
        var index = 1
        labels.each(function(){
          if (index != labels.length) {
            var attr = $(labels[index]).attr("for")
            $(labels[index]).attr("for", attr.replace(/[\d+]/, timeStamp))
          }
          index ++
        });

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "checkboxes"){
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });

        // labels
        $($($clonedRepeater[i]).find('label')[0]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer")

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "date") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });
        // labels
        $($($clonedRepeater[i]).find('label')).attr('for',"survey_observations_attributes_" + timeStamp + "_answer")


      }else if ($($clonedRepeater[i]).attr('data-element-type') == "email") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });

        // labels
        $($($clonedRepeater[i]).find('label')).attr('for',"survey_observations_attributes_" + timeStamp + "_answer")


      }else if ($($clonedRepeater[i]).attr('data-element-type') == "helper") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "number") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });

        // labels
        $($($clonedRepeater[i]).find('label')).attr('for',"survey_observations_attributes_" + timeStamp + "_answer")

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "line") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });


      }else if ($($clonedRepeater[i]).attr('data-element-type') == "static") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);


        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });
      }else if ($($clonedRepeater[i]).attr('data-element-type') == "text") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        var inputs = $($clonedRepeater[i]).find('input')
        var lastInputIndex = inputs.length - 1
        var index = 0
        $(inputs[lastInputIndex]).attr("value", dataEntry)
        inputs.each(function(){
          $(inputs[index]).attr("id", $(inputs[index]).attr("id").replace(/[\d+]/, timeStamp))
          $(inputs[index]).attr("name", $(inputs[index]).attr("name").replace(/[\d+]/, timeStamp))
          index ++
        });

        // labels
        $($($clonedRepeater[i]).find('label')).attr('for',"survey_observations_attributes_" + timeStamp + "_answer")
      }
      timeStamp  =  new Date().getTime()
    };
  };
});
