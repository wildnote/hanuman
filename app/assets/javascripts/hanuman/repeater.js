$(document).ready(function(){
  $dataEntry = parseInt($('.panel-body div:nth-child(4)').attr('data-entry'))
  $fileInput = "<input id='survey_observations_attributes_6_question_id' name='survey[observations_attributes][6][question_id]' type='hidden' value='665'><div class='form-group'><label class='col-sm-5 control-label' for='survey_observations_attributes_6_answer'>Photo(s)</label><div class='col-sm-7'><input accept='image/jpeg,image/png,image/gif,image/jpeg' class='attachinary-input' data-attachinary='{&quot;accessible&quot;:true,&quot;accept&quot;:[&quot;jpg&quot;,&quot;png&quot;,&quot;gif&quot;,&quot;jpeg&quot;],&quot;single&quot;:false,&quot;scope&quot;:&quot;photos&quot;,&quot;plural&quot;:&quot;photos&quot;,&quot;singular&quot;:&quot;photo&quot;,&quot;files&quot;:[]}' data-form-data='{&quot;timestamp&quot;:1455557107,&quot;callback&quot;:&quot;http://localhost:3000/attachinary/cors&quot;,&quot;tags&quot;:&quot;development_env,attachinary_tmp&quot;,&quot;signature&quot;:&quot;1ad5fade47fc998473aade7cc12f82ee0065bc95&quot;,&quot;api_key&quot;:&quot;621913215876889&quot;}' data-url='https://api.cloudinary.com/v1_1/wildnote-dev/auto/upload' id='survey_observations_attributes_6_photos' multiple='multiple' name='survey[observations_attributes][6][photos][]' type='file'><div class='attachinary_container' style='display: none;'><input type='hidden' name='survey[observations_attributes][6][photos][]' value=''></div><input id='survey_observations_attributes_6_entry' name='survey[observations_attributes][6][entry]' type='hidden' value='1'></div></div>"

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
        // $('.attachinary-input').attachinary()
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
