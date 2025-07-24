$(document).ready(function(){
  //  this if statement instantiates parsley on all pages other than survey
  // survey parsley is setup with data-required=true in dom
  if ($('[data-parsley-required=true]').length > 0) {
    $('form').parsley({ excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], input[type=number]' } )
  }

  // this event listener waits one second after user clicks on submit button so that parsley has enough time to add error elements if needed
  if ($('form.parsley-survey').length > 0 && $('[data-required=true]').length > 0) {
    $('input[type="submit"]').on('click', function(){

      // DEBUG: Add validation debugging
      setTimeout(function() {
        debugValidationErrors();
      }, 1000);

      // pulled from survey-status.js to determine current survey status to set required fields
      if ($('select#survey_survey_status_id').length > 0) {
        if ($('select#survey_survey_status_id').find(":selected").length > 0) {
          $selectedOption = $('select#survey_survey_status_id').find(":selected");
          var disableRequiredFields = $selectedOption.data('disable-required-fields');

          if (disableRequiredFields === 'true' || disableRequiredFields === true) {
            $('[data-parsley-required="true"]').attr('data-parsley-required', 'false');
            $('.form-container-entry-item[data-required="true"]').attr('data-required', 'disabled-by-status');
          } else {
            // NOW THAT WE NEED TO SET data-parsley-required to false based on hide/show, this block of code can't be used.
            // I've commented it out and it doesn't seem to be problematic. if i need to re-implement I would need to refactor
            // $('[data-parsley-required="false"]').attr('data-parsley-required', 'true');
            // $('.form-container-entry-item[data-required="disabled-by-status"]').attr('data-required', 'true');
          }
        }
      }

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
        validateLatLongAndPickers();
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
      $(".map-container, .map-toggle-button").on("click", function(){
        setTimeout(function(){
          $(".latlong-entry").parsley().validate()
        }, 200);
      })

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

    function singleSelectParsleyStyle() {
      // Select only those chosen selects that are required
      var requiredChosenSelects = $('select.chosen-select[data-parsley-required="true"]');

      // Move parsley error <ul> elements from top to bottom for each required chosen select
      requiredChosenSelects.each(function() {
        var $select = $(this);
        var parsleyErrorElements = $select.siblings('ul');
        $select.siblings('ul').remove();
        $select.closest('div.col-sm-7').append(parsleyErrorElements.first());
      });

      // Now work with singleChoiceInputs
      var singleChoiceInputs = $('a.chosen-single span:first-child');

      // Changes single choice input background-color to red/pink if input is empty and required
      singleChoiceInputs.each(function() {
        var $span = $(this);
        // Check if the closest associated select is required
        var findRequiredSelect = $span
            .closest('div.col-sm-7')
            .find('select.chosen-select[data-parsley-required="true"]')
            .length > 0;

        if ($span.text() === "Please select" && findRequiredSelect) {
          $span.closest('.chosen-single').css('background', "#F2DEDE");
          $span.css({'margin-right': '0px', 'background-color': '#F2DEDE'});
        } else if ($span.text() !== "Please select") {
          // If a valid selection is made, remove any existing error <ul>
          $span.closest('div.col-sm-7').find('select.chosen-select').siblings('ul').remove();
        }
      });
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

      // loop through all form inputs with data-required=true and pop data-parsley-required=true into the actual form element to get parsley to work
      var formInputs = $('form.form-horizontal').find('[data-required=true]');
      if (formInputs.length > 0) {
        formValidator.parsley();
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
    }

    setupRequiredData();
  }

  // this listener runs parsley validate on date fields everytime user interacts with the input to give instant feedback on any misformatted dates.
  $('.panel-body').on('change', '.datepicker', function(){
    $(this).parsley().validate()
  })
  $('.panel-body').on('change', '.latlong-entry', function(){
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

window.Parsley.addValidator('latlong', {
  validateString: function(cordinates) {
    var reg = /^-?\d+\.\d+\,\s?-?\d+\.\d+$/ ;
    return cordinates.match(reg) != null
  },
  messages: {
    en: 'LatLog cordinates must be valid. EX: 35.22767235493586, -120.38131713867188',
  }
});

// DEBUG: Function to show all validation errors
function debugValidationErrors() {
  var form = $('form.parsley-survey');
  var parsleyInstance = form.parsley();
  
  if (!parsleyInstance) {
    alert('DEBUG: No parsley instance found on form');
    return;
  }
  
  var isValid = parsleyInstance.validate();
  var failedFields = [];
  
  // Check all required fields
  $('[data-parsley-required="true"]').each(function() {
    var $field = $(this);
    var fieldName = $field.attr('name') || $field.attr('id') || 'Unknown field';
    var fieldValue = $field.val();
    var fieldType = $field.attr('type') || $field.prop('tagName').toLowerCase();
    
    // Check if field is visible and not empty
    var isVisible = $field.is(':visible') && $field.closest('.form-container-entry-item').is(':visible');
    var isEmpty = !fieldValue || fieldValue === '' || fieldValue === 'Please select';
    
    if (isVisible && isEmpty) {
      failedFields.push({
        name: fieldName,
        type: fieldType,
        value: fieldValue,
        visible: isVisible,
        elementType: $field.closest('.form-container-entry-item').attr('data-element-type') || 'unknown'
      });
    }
  });
  
  // Check for parsley error elements
  var parsleyErrors = $('.parsley-error');
  var errorMessages = [];
  
  parsleyErrors.each(function() {
    var $errorField = $(this);
    var $container = $errorField.closest('.form-container-entry-item');
    var fieldName = $errorField.attr('name') || $errorField.attr('id') || 'Unknown field';
    var errorText = $errorField.siblings('.parsley-errors-list').text() || 'No error message';
    
    // Get question text from the container
    var questionText = $container.find('label').first().text().trim() || 
                      $container.find('.question-text').text().trim() ||
                      $container.find('h4, h5, h6').first().text().trim() ||
                      'Unknown question';
    
    errorMessages.push(fieldName + ' (Question: ' + questionText + '): ' + errorText);
  });
  
  // Build debug message
  var debugMessage = 'Form Valid: ' + isValid + '\n\n';
  debugMessage += 'Failed Fields (' + failedFields.length + '):\n';
  
  failedFields.forEach(function(field) {
    debugMessage += '- ' + field.name + ' (' + field.elementType + '): "' + field.value + '"\n';
  });
  
  if (errorMessages.length > 0) {
    debugMessage += '\nParsley Error Messages:\n';
    errorMessages.forEach(function(msg) {
      debugMessage += '- ' + msg + '\n';
    });
  }
  
  // Check for hidden required fields
  var hiddenRequired = $('[data-parsley-required="true"]').filter(function() {
    return !$(this).is(':visible') || !$(this).closest('.form-container-entry-item').is(':visible');
  });
  
  if (hiddenRequired.length > 0) {
    debugMessage += '\nHidden Required Fields:\n';
    hiddenRequired.each(function() {
      var $field = $(this);
      var $container = $field.closest('.form-container-entry-item');
      var fieldName = $field.attr('name') || $field.attr('id') || 'Unknown field';
      
      // Get question text from the container
      var questionText = $container.find('label').first().text().trim() || 
                        $container.find('.question-text').text().trim() ||
                        $container.find('h4, h5, h6').first().text().trim() ||
                        'Unknown question';
      
      debugMessage += '- ' + fieldName + ' (Question: ' + questionText + ')\n';
    });
  }
  
  // Check for hidden fields with other validation (like number fields with text)
  var hiddenFieldsWithValidation = $('input[type="number"], input[data-parsley-type], input[data-parsley-pattern]').filter(function() {
    return !$(this).is(':visible') || !$(this).closest('.form-container-entry-item').is(':visible');
  });
  
  if (hiddenFieldsWithValidation.length > 0) {
    debugMessage += '\nHidden Fields with Validation:\n';
    hiddenFieldsWithValidation.each(function() {
      var $field = $(this);
      var $container = $field.closest('.form-container-entry-item');
      var fieldName = $field.attr('name') || $field.attr('id') || 'Unknown field';
      var fieldType = $field.attr('type') || 'text';
      var validationType = $field.attr('data-parsley-type') || $field.attr('data-parsley-pattern') || 'none';
      
      // Get question text from the container
      var questionText = $container.find('label').first().text().trim() || 
                        $container.find('.question-text').text().trim() ||
                        $container.find('h4, h5, h6').first().text().trim() ||
                        'Unknown question';
      
      debugMessage += '- ' + fieldName + ' (Type: ' + fieldType + ', Validation: ' + validationType + ', Question: ' + questionText + ')\n';
    });
  }
  
  alert('DEBUG VALIDATION ERRORS:\n\n' + debugMessage);
}
