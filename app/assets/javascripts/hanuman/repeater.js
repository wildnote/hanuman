$(document).ready(function(){
  $dataEntry = parseInt($('.panel-body div:nth-child(4)').attr('data-entry'))
  $fileInput = $('.attachinary-input:first-child').parent().parent().parent().prop('outerHTML')

  $('.duplicate').on("click", function(e){
    e.preventDefault();
    $target = $(event.target);
    $container = $target.closest('.form-entry-item-container');
    questionId = $container.attr('data-question-id');
    entryId = $container.attr('data-entry');
    $repeater = $("[data-question-id=" + questionId + "][data-entry=" + entryId + "],[data-ancestor=" + questionId + "][data-entry=" + entryId + "]");
    stringified = $repeater.prop('outerHTML');

    $clonedRepeater = $repeater.clone(true)
    $dataEntry = $dataEntry + 1
    updateDom($clonedRepeater, $dataEntry )
    $('.panel-body').append($clonedRepeater)
    var timeInput = $('div.col-sm-7 input:first-child[type=time]').last().parent().parent().parent()
    $(timeInput).remove()
    $('div.panel-body').append(timeInput)
    $('.attachinary-input').attachinary()

    // removes latlong cordinated from new form
    $('input.latlong-entry').last().val("")

    // shows uploaded file name
    $('input[type=file]').fileupload('option', 'replaceFileInput', false);
  });


  function updateDom($clonedRepeater, dataEntry){
    var timeStamp = new Date().getTime()
    for (var i = 0; i < $clonedRepeater.length; i++) {
      if ($($clonedRepeater[i]).attr('data-element-type') == "container") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($clonedRepeater[i]).find('input').first().attr('id', "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeater[i]).find('input').first().attr('name', "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeater[i]).find('input')[1]).attr('id', "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeater[i]).find('input')[1]).attr('name', "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeater[i]).find('input')[1]).attr('value', dataEntry);

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "select") {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);

        // inputs
        $($($clonedRepeater[i]).find('input')[0]).attr('id',"survey_observations_attributes_" + timeStamp + "_question_id")
        $($($clonedRepeater[i]).find('input')[0]).attr('name',"survey[observations_attributes][" + timeStamp + "][question_id]")
        $($($clonedRepeater[i]).find('input')[1]).attr('id',"survey_observations_attributes_" + timeStamp + "_selectable_type")
        $($($clonedRepeater[i]).find('input')[1]).attr('name',"survey[observations_attributes][" + timeStamp + "][selectable_type]")
        $($($clonedRepeater[i]).find('input')[2]).attr('id',"survey_observations_attributes_" + timeStamp + "_entry")
        $($($clonedRepeater[i]).find('input')[2]).attr('name',"survey[observations_attributes][" + timeStamp + "][entry]")
        $($($clonedRepeater[i]).find('input')[2]).attr('value', dataEntry)
        // labels
        $($clonedRepeater[i]).find('label').attr("for", "survey_observations_attributes_" + timeStamp + "_answer")

      }else if ($($clonedRepeater[i]).attr('data-element-type') == 'map') {
        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($($clonedRepeater[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($($clonedRepeater[i]).find('input')[2]).attr("value", dataEntry);
        //  labels
        $($($clonedRepeater[i]).find('label')[3]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "multiselect") {


        $($clonedRepeater[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("id", "survey_observations_attributes_" + timeStamp + "_entry")
        $($clonedRepeater[i]).find('input:nth-child(2)').attr("name", "survey[observations_attributes][" + timeStamp + "][entry]")
        $($($clonedRepeater[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeater[i]).find('input')[2]).attr("value", dataEntry);
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
        $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeater[i]).find('input')[1]).attr("value", dataEntry);
        // textareas
        $($($clonedRepeater[i]).find('textarea')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($($clonedRepeater[i]).find('textarea')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        // labels
        $($($clonedRepeater[i]).find('label').first()).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeater[i]).attr('data-element-type') == "file"){

        $($clonedRepeater[i]).attr('data-entry', dataEntry);

        // replace file input html
        $($clonedRepeater[i]).html($fileInput)

        // inputs
        $($($clonedRepeater[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeater[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeater[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_photos");
        $($($clonedRepeater[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][photos][]");
        $($($clonedRepeater[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][photos][]");
        $($($clonedRepeater[i]).find('input')[3]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry")
        $($($clonedRepeater[i]).find('input')[3]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeater[i]).find('input')[3]).attr("value", dataEntry)


        // label
        $($($clonedRepeater[i]).find('label')[0]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      };
      timeStamp  =  new Date().getTime()
    };
  };
});
