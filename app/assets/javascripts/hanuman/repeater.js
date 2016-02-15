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

    $clonedRepeator = $repeater.clone(true)
    $dataEntry = $dataEntry + 1
    updateDom($clonedRepeator, $dataEntry )
    $('.panel-body').append($clonedRepeator)
    var timeInput = $('div.col-sm-7 input:first-child[type=time]').last().parent().parent().parent()
    $(timeInput).remove()
    $('div.panel-body').append(timeInput)
    $('.attachinary-input').attachinary()
    
    // removed latlong cordinated from new form
    $('input.latlong-entry').last().val("")

    // shows uploaded file name
    $('input[type=file]').fileupload('option', 'replaceFileInput', false);
  });


  function updateDom($clonedRepeator, dataEntry){
    var timeStamp = new Date().getTime()
    for (var i = 0; i < $clonedRepeator.length; i++) {
      if ($($clonedRepeator[i]).find('div.form-section').text().trim().replace("                        +", "").trim() == "Observation") {
        // data entry attribute
        $($clonedRepeator[i]).attr('data-entry', dataEntry);
        // inputs
        $($clonedRepeator[i]).find('input').first().attr('id', "survey_observations_attributes_" + timeStamp + "_question_id");
        $($clonedRepeator[i]).find('input').first().attr('name', "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[1]).attr('id', "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeator[i]).find('input')[1]).attr('name', "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[1]).attr('value', dataEntry);

      }else if ($($clonedRepeator[i]).find('label').text() == "Location") {
        $($clonedRepeator[i]).attr('data-entry', dataEntry)
        // inputs
        $($($clonedRepeator[i]).find('input')[0]).attr('id',"survey_observations_attributes_" + timeStamp + "_question_id")
        $($($clonedRepeator[i]).find('input')[0]).attr('name',"survey[observations_attributes][" + timeStamp + "][question_id]")
        $($($clonedRepeator[i]).find('input')[1]).attr('id',"survey_observations_attributes_" + timeStamp + "_selectable_type")
        $($($clonedRepeator[i]).find('input')[1]).attr('name',"survey[observations_attributes][" + timeStamp + "][selectable_type]")
        $($($clonedRepeator[i]).find('input')[2]).attr('id',"survey_observations_attributes_" + timeStamp + "_entry")
        $($($clonedRepeator[i]).find('input')[2]).attr('name',"survey[observations_attributes][" + timeStamp + "][entry]")
        $($($clonedRepeator[i]).find('input')[2]).attr('value', dataEntry)
        // labels
        $($clonedRepeator[i]).find('label').attr("for", "survey_observations_attributes_" + timeStamp + "_answer")

      }else if ($($($clonedRepeator[i]).find('label')[3]).text() == "Enter lat/long of location selected above") {

        // data entry attribute
        $($clonedRepeator[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeator[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeator[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($($clonedRepeator[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($($clonedRepeator[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeator[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        $($($clonedRepeator[i]).find('input')[2]).attr("value", dataEntry);
        //  labels
        $($($clonedRepeator[i]).find('label')[3]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

        // empty the input
      }else if ($($clonedRepeator[i]).find('label').first().text() == "Plant(s) observed") {
        // data entry attribute
        $($clonedRepeator[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeator[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeator[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[2]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeator[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeator[i]).find('input')[2]).attr("value", dataEntry);
        //selects
        $($($clonedRepeator[i]).find('select')).attr('id', "survey_observations_attributes_" + timeStamp + "_taxon_ids_");
        $($($clonedRepeator[i]).find('select')).attr('name', "survey[observations_attributes][" + timeStamp + "][taxon_ids][]");
        // labels
        $($($clonedRepeator[i]).find('label')).attr('for', "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeator[i]).find('label').first().text() == "Enter special info about Eel grass") {
        // data entry attribute
        $($clonedRepeator[i]).attr('data-entry', dataEntry);
        // inputs
        $($($clonedRepeator[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeator[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry");
        $($($clonedRepeator[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeator[i]).find('input')[1]).attr("value", dataEntry);
        // textareas
        $($($clonedRepeator[i]).find('textarea')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_answer");
        $($($clonedRepeator[i]).find('textarea')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][answer]");
        // 1 labels
        $($($clonedRepeator[i]).find('label').first()).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      }else if ($($clonedRepeator[i]).find('label:first-child').text() == "Photo(s)"){
        // data entry attribute
        $($clonedRepeator[i]).attr('data-entry', dataEntry);

        // replace file input html
        $($clonedRepeator[i]).html($fileInput)

        // inputs
        $($($clonedRepeator[i]).find('input')[0]).attr("id", "survey_observations_attributes_" + timeStamp + "_question_id");
        $($($clonedRepeator[i]).find('input')[0]).attr("name", "survey[observations_attributes][" + timeStamp + "][question_id]");
        $($($clonedRepeator[i]).find('input')[1]).attr("id", "survey_observations_attributes_" + timeStamp + "_photos");
        $($($clonedRepeator[i]).find('input')[1]).attr("name", "survey[observations_attributes][" + timeStamp + "][photos][]");
        $($($clonedRepeator[i]).find('input')[2]).attr("name", "survey[observations_attributes][" + timeStamp + "][photos][]");
        $($($clonedRepeator[i]).find('input')[3]).attr("id", "survey_observations_attributes_" + timeStamp + "_entry")
        $($($clonedRepeator[i]).find('input')[3]).attr("name", "survey[observations_attributes][" + timeStamp + "][entry]");
        $($($clonedRepeator[i]).find('input')[3]).attr("value", dataEntry)


        // label
        $($($clonedRepeator[i]).find('label')[0]).attr("for", "survey_observations_attributes_" + timeStamp + "_answer");

      };
      timeStamp  =  new Date().getTime()
    };
  };
});
