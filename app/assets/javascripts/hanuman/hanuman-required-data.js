$(document).ready(function(){

  //  validates all survey forms for date inputs and forms with required fields.
  $('form').parsley()

  // this event listener waits one second after user clicks on submit button so that parsley has enough time to add error elements if needed
  if ($('form.parsley-survey').length > 0 && $('[data-required=true]').length > 0) {

    $('input[type="submit"]').on('click', function(){
      //  this code runs through all the file inputs on survey edit and removes the parsley attrs if the inputs  already have an upload.
      //  if we dont have this code, then the survey will not save because parsley will think the input file is empty.
      if ($(".edit-mode-file").length > 0) {
        var fileInputs = $('input[type=file]').siblings('div.upload-view-mode').find('input[type=hidden]')
        for (var i = 0; i < fileInputs.length; i++) {
          if ($(fileInputs[i]).val() != "") {
            $(fileInputs[i]).parents('.file-upload-input-button').find('.cloudinary-fileupload').removeAttr('data-parsley-required')
          }
        }
      }


      // special elements that don't work out of the box with parsley, having to write code to validate and position error messages
      setTimeout(function(){
        multiSelectParsleyStyle();
        singleSelectParsleyStyle();
        validateLatLongAndPickers()
      }, 200);
    });


    validateLatLongAndPickers = function(){
      // this sets the field back to green once a user enters a date (should happen automatically with parsley, maybe datepicker is blocking somehow)
      $('input.datepicker').change(function(){
        $(this).parsley().validate();
      });

      // setup listener when click on edit map button, don't need to setup listener unless user has already triggered parsley error messaging
      $(".panel-body").on("click","a.edit-map", function(){
        var index = 0
        $('div.gm-style').each(function() {
          $($($($('div.gm-style')[index]).children('div:first-child')).children('div:nth-child(2)')).addClass("map-listener")
          index++
        })
        mapClickListener()
      });
    };

    function mapClickListener(){
      // run parsley validation whenever user clicks on div with class map-listener
      $(".panel-body").on('click',"div.map-listener",  function(){
        setTimeout( function(){
          var index = 0
          $('input.latlong-entry').each(function(){
            $($('input.latlong-entry')[index]).parsley().validate()
            index++
          })
        }, 500)
      });
    }

    // sets background colors to green upon success on selects and multiselects
    $.listen('parsley:field:success', function(parsleyField) {

      // this code listens to success on taxon checkboxes to remove error background-color
      setTimeout(function(){
        if (parsleyField.$element.siblings('div').find('button').length >= 1) {
          if (parsleyField.$element.siblings('div').find('button').attr('title') != "None selected") {
            parsleyField.$element.siblings('div').find('button').css('background-color','#DFF0D8')
          }
        }
      }, 500)

      if (parsleyField.$element.is('select')){
        if ($(parsleyField.$element.closest('div.form-container-entry-item')).attr('data-element-type') === "multiselect") {
          $($(parsleyField.$element.closest('div.form-container-entry-item')).find('ul.chosen-choices')).removeAttr('style').css('background', "#DFF0D8");
        }
        parsleyField.$element.siblings('.chosen-container').find('span').removeAttr('style');
        parsleyField.$element.parent().parent().find('.chosen-single').css('background', "#DFF0D8");
        parsleyField.$element.siblings('ul').remove();
      }
    });

    // this code listens to error on taxon checkboxes to add error background-color
    $.listen('field:error', function(parsleyField) {
      setTimeout(function(){
        if (parsleyField.$element.siblings('div').find('button').length >= 1) {
          if (parsleyField.$element.siblings('div').find('button').attr('title') === "None selected") {
            parsleyField.$element.siblings('div').find('button').css('background-color', '#F2DEDE')
          }
        }
      }, 500)
    });

    function singleSelectParsleyStyle(){
      // moves parsley error <ul> element from top to bottom of the single choice input
      var parsleyErrorElements = $('select.chosen-select').siblings('ul');
      $('select.chosen-select').siblings('ul').remove();
      $('select.chosen-select').closest('div.col-sm-7').append(parsleyErrorElements.first());
      var singleChoiceInputs = $('a.chosen-single span:first-child');
      // Changes single choice input background-color to red/pink if input is empty
      for (var i = 0; i < singleChoiceInputs.length; i++) {
        if ($(singleChoiceInputs[i]).text() === "Please select") {
          $($($(singleChoiceInputs[i]).parent().parent()).find('.chosen-single ')).css('background',"#F2DEDE")
          $(singleChoiceInputs[i]).attr("style",'margin-right: 0px; background-color:#F2DEDE;');
        }else if ($(singleChoiceInputs[i]).text() != "Please select"){
          $(singleChoiceInputs[i]).parent().parent().siblings('select.chosen-select').siblings('ul').remove();
        }
      }
    }

    function multiSelectParsleyStyle(){
      // line up error message on all regular multiselects
      $('div.form-container-entry-item[data-element-type=multiselect]').find('ul.parsley-errors-list').css('margin-left','43%')
      // line up error messages on chosen-multiselects
      var chosenSelector = $('select.chosen-multiselect').closest('div.form-container-entry-item[data-required=true]')
      $(chosenSelector).find('ul.parsley-errors-list').css('margin-left','43%')
      $(chosenSelector).find('select.chosen-multiselect').css('background-color','#F2DEDE')
      var i = 0;
      chosenSelector.each(function(){
        if (!$(chosenSelector[i]).find('ul.chosen-choices li').hasClass('search-choice')) {
          $(chosenSelector[i]).find('ul.chosen-choices').attr('style','background:none; background-color:#F2DEDE;')
        }
        i++
      });
    }

    // listens to file upload and removes parsley errors
    $('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) {
      $(e.target).siblings('ul.parsley-errors-list').remove()
      $(e.target).removeClass('parsley-error')
    });


    // reads dom for required fields
    function setupRequiredData(){
      var formValidator = $('form.parsley-survey');
      formValidator.parsley();

      // loop through all form inputs with data-required=true and pop data-parsley-required=true into the actual form element to get parsley to work
      var formInputs = $('form.form-horizontal').find('[data-required=true]');

      for (var i = 0; i < formInputs.length; i++) {
        var formControlElement = $(formInputs[i]).find('.form-control').not('.multiselect-search');
        if (formControlElement) {
          formControlElement.attr('data-parsley-required','true');
          // for checkboxes set to min 1
          if ($(formInputs[i]).attr('data-element-type') === 'checkboxes') {
            formControlElement.attr('data-parsley-mincheck','1');
          }
        }
        // find photo, document and video upload buttons
        var fileElement = $(formInputs[i]).find('input[type=file]');
        if (formControlElement) {
          fileElement.attr('data-parsley-required','true');
        }
      }
    }

    setupRequiredData();
  };

  // this listener runs parsley validate on date fields everytime user interacts with the input to give instant feedback on any misformatted dates.
  $('.panel-body').on('change', '.datepicker', function(){
    $(this).parsley().validate()
  })

});

// custom parsley validation for date format:  MM/DD/YYYY.
window.Parsley.addValidator('dateformat', {
  validateString: function(date) {
    var reg = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
    return date.match(reg) != null
  },
  messages: {
    en: 'date must match format MM/DD/YYYY',
  }
});
