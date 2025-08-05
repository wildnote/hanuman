(function() {
  function ConditionalLogic() {
    this.boundElements = [];
    this.allowCascade = false;
  }

  ConditionalLogic.prototype.findRules = function(runCalcs, runConditionals, $context) {
    var self = this;
    var problemWithCL = false;

    $context.find("[data-rule!=''][data-rule]").each(function() {
      var $ruleContainer = $(this);
      var rules = $.parseJSON($ruleContainer.attr("data-rule"));

      $(rules).each(function() {
        var rule = this;
        var matchType = rule.match_type;

        $(rule.conditions).each(function() {
          var conditionQuestionId = this.question_id;
          var $conditionContainer = $ruleContainer.siblings("[data-question-id=" + conditionQuestionId + "]");

          if ($conditionContainer.length < 1) {
            $conditionContainer = $("[data-question-id=" + conditionQuestionId + "]");
          }

          if (($conditionContainer.length === 0 || $conditionContainer.length > 1) && rule.type !== 'Hanuman::CalculationRule') {
            problemWithCL = true;
          }

          var $conditionElement = $conditionContainer.find(".form-control");
          if ($conditionElement.length < 1) {
            $conditionElement = $conditionContainer.find(".form-control-static");
          }

          if ($conditionElement.length === 0 && rule.type !== 'Hanuman::CalculationRule') {
            problemWithCL = true;
          }

          var ancestorId = rule.question_id;

          if ($conditionElement.length < 2) {
            self.bindConditions($conditionElement, rule, $ruleContainer, this.id);
          } else {
            if ($conditionElement.is(":checkbox")) {
              if (rule.type !== 'Hanuman::CalculationRule') {
                $conditionElement = $conditionContainer.find(".form-control[data-label-value='" + this.answer.replace("/", "\\/").replace("'", "\\'") + "']");
              }
              self.bindConditions($conditionElement, rule, $ruleContainer, this.id);
            } else {
              $conditionElement.each(function(index, element) {
                self.bindConditions($(element), rule, $ruleContainer, this.id);
              });
            }
          }

          var inRepeater = false;
          var $repeater = $conditionElement.closest(".form-container-repeater");
          if ($repeater.length > 0) {
            inRepeater = true;
          }

          if (rule.type !== "Hanuman::CalculationRule") {
            if (runConditionals) {
              self.checkConditionsAndHideShow(rule.conditions, ancestorId, $ruleContainer, $ruleContainer, inRepeater, matchType, rule, true);
            }
          }
        });

        if (runCalcs && rule.type === "Hanuman::CalculationRule") {
          self.updateCalculation(rule, $ruleContainer);
        }
      });
    });

    if (problemWithCL) {
      var e = new Error("conditional Logic # findRules");
      e.name = 'FAILED: conditional logic';
      Honeybadger.notify(e, {
        context: {
          type: "FAILED: conditional logic => condition container or element not found or found more than once",
          details: window.location.href
        }
      });
    }

    self.allowCascade = true;
  };

  ConditionalLogic.prototype.bindConditions = function($triggerElement, rule, $ruleContainer, conditionId) {
    var self = this;

    if (rule.type === "Hanuman::CalculationRule") {
      var idx = self.boundElements.findIndex(function(el) {
        return $triggerElement[0] === el[0] && conditionId === el[1] && rule.id === el[2] && $ruleContainer[0] === el[3];
      });

      if (idx !== -1) {
        return;
      }

      self.boundElements.push([$triggerElement[0], conditionId, rule.id, $ruleContainer[0]]);
    }

    $triggerElement.on("change", function() {
      if (rule.type === "Hanuman::CalculationRule") {
        self.updateCalculation(rule, $ruleContainer, true);
        return;
      }

      var $repeater = $($triggerElement).closest(".form-container-repeater");

      if ($repeater.length > 0) {
        $repeater.find("[data-rule!=''][data-rule]").each(function() {
          var $ruleElement = $(this);
          var rules = $.parseJSON($ruleElement.attr("data-rule"));

          $(rules).each(function() {
            var matchType = this.match_type;
            var questionId = $triggerElement.closest('.form-container-entry-item').attr('data-question-id');
            var conditions = this.conditions;
            var ancestorId = this.question_id;
            var matchingCondition = _.where(conditions, { question_id: Number(questionId) });

            if (matchingCondition.length > 0) {
              if (conditions.length > 1) {
                self.checkConditionsAndHideShow(conditions, ancestorId, $ruleElement, $ruleElement, true, matchType, this, false);
              } else {
                var hideQuestions = self.setHideQuestions(conditions[0], $triggerElement);
                if (this.type === "Hanuman::VisibilityRule") {
                  self.hideShowQuestions(hideQuestions, ancestorId, $ruleElement, $ruleElement, true);
                } else if (hideQuestions === false) {
                  self.setLookupValue(this.value, $ruleElement);
                }
              }
            }
          });
        });
      } else {
        $($triggerElement).closest(".form-container-survey").find("[data-rule!=''][data-rule]").each(function() {
          var $ruleElement = $(this);
          var rules = $.parseJSON($ruleElement.attr("data-rule"));

          $(rules).each(function() {
            var matchType = this.match_type;
            var questionId = $triggerElement.closest('.form-container-entry-item').attr('data-question-id');
            var conditions = this.conditions;
            var ancestorId = this.question_id;
            var matchingCondition = _.where(conditions, { question_id: Number(questionId) });

            if (matchingCondition.length > 0) {
              if (conditions.length > 1) {
                self.checkConditionsAndHideShow(conditions, ancestorId, $ruleElement, $ruleElement, false, matchType, this, false);
              } else {
                var hideQuestions = self.setHideQuestions(conditions[0], $triggerElement);
                if (this.type === "Hanuman::VisibilityRule") {
                  self.hideShowQuestions(hideQuestions, ancestorId, $ruleElement, $ruleElement, false);
                } else if (hideQuestions === false) {
                  self.setLookupValue(this.value, $ruleElement);
                }
              }
            }
          });
        });
      }
    });
  };

  ConditionalLogic.prototype.checkConditionsAndHideShow = function(conditions, ancestorId, $ruleElement, $container, inRepeater, matchType, rule) {
    var self = this;
    var conditionMetTracker = [];

    $.each(conditions, function(index, condition) {
      var $conditionElement = inRepeater
          ? $container.parents(".form-container-repeater").find("[data-question-id=" + condition.question_id + "]").find('.form-control')
          : $("[data-question-id=" + condition.question_id + "]").find('.form-control');

      if ($conditionElement.length < 1) {
        $conditionElement = inRepeater
            ? $container.parents(".form-container-repeater").find("[data-question-id=" + condition.question_id + "]").find('.form-control-static')
            : $("[data-question-id=" + condition.question_id + "]").find('.form-control-static');
      }

      var hideQuestions = self.setHideQuestions(condition, $conditionElement);
      conditionMetTracker.push(!hideQuestions);
    });

    var hideShow = (matchType === "all")
        ? conditionMetTracker.indexOf(false) !== -1
        : conditionMetTracker.indexOf(true) === -1;

    if (rule.type === "Hanuman::VisibilityRule") {
      self.hideShowQuestions(hideShow, ancestorId, $ruleElement, $container, inRepeater);
    } else if (!hideShow && rule.type === "Hanuman::LookupRule") {
      self.setLookupValue(rule.value, $ruleElement);
    }
  };

  ConditionalLogic.prototype.setLookupValue = function(value, $ruleElement) {
    var answerType = $ruleElement.data('element-type');
    var selectedOptions;

    switch (answerType) {
      case 'radio':
        $ruleElement.find('input[type="radio"][data-answer-choice-id="' + value + '"]')
            .prop("checked", true)
            .trigger('change');
        break;

      case 'checkbox':
        $ruleElement.find('input[type="checkbox"]')
            .prop("checked", true)
            .trigger('change');
        break;

      case 'checkboxes':
        selectedOptions = value.split(",");
        $ruleElement.find('input[type="checkbox"]').each(function() {
          if (selectedOptions.indexOf($(this).attr('value')) !== -1) {
            $(this).prop("checked", true).trigger('change');
          } else {
            $(this).prop("checked", false).trigger('change');
          }
        });
        break;

      case 'chosenmultiselect':
        selectedOptions = value.split(",");
        $ruleElement.find('input[type="select"]')
            .val(selectedOptions)
            .trigger('chosen:updated');
        break;

      case 'chosenselect':
        $ruleElement.find('input[type="select"]')
            .val(value)
            .trigger('chosen:updated');
        break;

      case 'counter':
        $ruleElement.find('input[type="number"]').val(value);
        break;

      case 'date':
      case 'number':
      case 'text':
      case 'time':
        $ruleElement.find('input[type="text"]').val(value);
        break;

      case 'textarea':
        $ruleElement.find('textarea').val(value);
        break;
    }
  };

  ConditionalLogic.prototype.setHideQuestions = function(condition, $triggerElement) {
    var operator = condition.operator;
    var answer = condition.answer;
    var elementType = $triggerElement.closest('.form-container-entry-item').attr('data-element-type');
    var selectedArray, namedString, selectedValues, hideQuestions, selectedValue;

    if (elementType === 'checkboxes') {
      // Concatenate all values of checked checkboxes
      namedString = "input:checkbox[name='" + $triggerElement.attr('name') + "']:checked";
      selectedArray = $(namedString).map(function() {
        return $(this).attr('data-label-value');
      }).get();

      // Force "is equal to" operator to "contains" since multiple checkboxes need to be checked
      hideQuestions = this.evaluateCheckboxConditions(operator, answer, selectedArray);
    } else if (elementType === 'multiselect') {
      selectedValues = this.getValue($triggerElement);
      if (selectedValues) {
        selectedArray = selectedValues.split('|&|');
        hideQuestions = this.evaluateCheckboxConditions(operator, answer, selectedArray);
      } else {
        return true;
      }
    } else if ($triggerElement.hasClass('multiselect')) {
      selectedArray = JSON.parse($triggerElement.attr('multiselectarray'));
      hideQuestions = this.evaluateCheckboxConditions(operator, answer, selectedArray);
    } else if ($triggerElement.hasClass('singleselect')) {
      selectedValue = $triggerElement.attr('selectedvalue');
      hideQuestions = this.evaluateCondition(operator, answer, selectedValue);
    } else {
      hideQuestions = this.evaluateCondition(operator, answer, this.getValue($triggerElement));
    }

    return hideQuestions;
  };

  ConditionalLogic.prototype.hideShowQuestions = function(hideQuestions, ancestorId, $ruleElement, $container, inRepeater) {
    var $childrenContainers, $childrenItems;

    // Update the container visibility
    if (hideQuestions) {
      $container.addClass("conditional-logic-hidden");
      $container.find('input.form-control, textarea.form-control, select.form-control').each(function() {
        $(this).attr('data-parsley-required', 'false');
      });

      $container.find('input.cloudinary-fileupload').each(function() {
        $(this).attr('data-parsley-required', 'false');
      });
      
      // Set hidden field to true (if it exists)
      var $hiddenField = $container.find('.hidden-field-observation-hidden');
      if ($hiddenField.length > 0) {
        $hiddenField.val('true');
      }
    } else {
      $container.removeClass("conditional-logic-hidden");

      if ($container.attr("data-required") === "true") {
        $container.find('input.form-control, textarea.form-control, select.form-control').each(function() {
          $(this).attr('data-parsley-required', 'true');
        });

        $container.find('input.cloudinary-fileupload').each(function() {
          $(this).attr('data-parsley-required', 'true');
        });
      }
      
      // Set hidden field to false (if it exists)
      var $hiddenField = $container.find('.hidden-field-observation-hidden');
      if ($hiddenField.length > 0) {
        $hiddenField.val('false');
      }
    }

    // Update child containers inside repeaters or sections
    $childrenContainers = $container.find('.panel-observation');
    $childrenContainers.each(function() {
      var $child = $(this);
      if ($child.attr("data-rule") === "") {
        if (hideQuestions) {
          $child.addClass("conditional-logic-hidden");
          $child.find('input.form-control').each(function() {
            $(this).attr('data-parsley-required', 'false');
          });
        } else {
          $child.removeClass("conditional-logic-hidden");
          $child.find('input.form-control').each(function() {
            if ($(this).closest('.form-group').attr("data-required") === "true") {
              $(this).attr('data-parsley-required', 'true');
            }
          });
        }
      }
    });

    // Update form-container-entry-item elements
    $childrenItems = $container.find('.form-container-entry-item');
    $childrenItems.each(function() {
      var $child = $(this);
      if ($child.attr("data-rule") === "") {
        if (hideQuestions) {
          $child.find('input.form-control, textarea.form-control, select.form-control').each(function() {
            $(this).attr('data-parsley-required', 'false');
          });

          $child.find('input.cloudinary-fileupload').each(function() {
            $(this).attr('data-parsley-required', 'false');
          });
        } else {
          if ($child.attr("data-required") === "true") {
            $child.find('input.form-control, textarea.form-control, select.form-control').each(function() {
              $(this).attr('data-parsley-required', 'true');
            });

            $child.find('input.cloudinary-fileupload').each(function() {
              $(this).attr('data-parsley-required', 'true');
            });
          }
        }
      }
    });

    // Trigger Parsley validation update for the container and its children
    $container.parsley();
  };

  ConditionalLogic.prototype.clearQuestions = function(container) {
    var textFields, textAreas, selects, checkboxes, radiobuttons, multiselects;

    // Clear out text fields
    textFields = container.find(":text");
    textFields.each(function() {
      if ($(this).attr("data-default-answer") && $(this).data("default-answer") !== "null") {
        $(this).val($(this).data("default-answer"));
      } else {
        $(this).val("");
      }
    });

    // Clear out text areas
    textAreas = container.find("textarea");
    textAreas.each(function() {
      if ($(this).attr("data-default-answer") && $(this).data("default-answer") !== "null") {
        $(this).val($(this).data("default-answer"));
      } else {
        $(this).val("");
      }
    });

    // Unselect dropdowns
    selects = container.find("select");
    selects.each(function() {
      if ($(this).attr("data-default-answer") && $(this).data("default-answer") !== "null") {
        $(this).val($(this).data("default-answer"));
      } else {
        $(this).val("");
      }

      if ($(this).hasClass('chosen')) {
        $(this).trigger("chosen:updated");
      }
    });

    // Uncheck all checkboxes
    checkboxes = container.find(":checkbox");
    checkboxes.each(function() {
      if ($(this).attr("data-default-answer") && $(this).data("default-answer") === "true") {
        $(this).prop('checked', true);
      } else {
        $(this).prop('checked', false);
      }
    });

    // Unselect radio buttons
    radiobuttons = container.find(":radio");
    radiobuttons.each(function() {
      if ($(this).attr("data-default-answer") && $(this).data("default-answer") !== "null" &&
          $(this).data("label-value") === $(this).data("default-answer")) {
        $(this).prop('checked', true);
      } else {
        $(this).prop('checked', false);
      }
    });

    // Unselect multi-select dropdowns
    multiselects = container.find("select[multiple]");
    multiselects.each(function() {
      var id = $(this).attr('id');
      $('#' + id + ' option:selected').removeAttr("selected");

      if ($(this).hasClass('chosen-multiselect')) {
        $(this).trigger("chosen:updated");
      }
    });
  };

  ConditionalLogic.prototype.evaluateCondition = function(operator, answer, value) {
    var hideQuestions = true;

    switch (operator) {
      case "is equal to":
        if (value == answer) {
          hideQuestions = false;
        }
        break;

      case "is not equal to":
        if (value != answer) {
          hideQuestions = false;
        }
        break;

      case "is empty":
        if (!value || (value && value.length < 1)) {
          hideQuestions = false;
        }
        break;

      case "is not empty":
        if (value && value.length > 0) {
          hideQuestions = false;
        }
        break;

      case "is greater than":
        if ($.isNumeric(value) && parseFloat(value) > parseFloat(answer)) {
          hideQuestions = false;
        }
        break;

      case "is less than":
        if ($.isNumeric(value) && parseFloat(value) < parseFloat(answer)) {
          hideQuestions = false;
        }
        break;

      case "starts with":
        if (value && value.slice(0, answer.length) === answer) {
          hideQuestions = false;
        }
        break;

      case "contains":
        if (value && value.indexOf(answer) > -1) {
          hideQuestions = false;
        }
        break;
    }

    return hideQuestions;
  };

  ConditionalLogic.prototype.evaluateCheckboxConditions = function(operator, answer, valueArray) {
    var hideQuestions = true;

    for (var i = 0; i < valueArray.length; i++) {
      var value = valueArray[i];

      switch (operator) {
        case "is equal to":
          if (value == answer) {
            hideQuestions = false;
          }
          break;

        case "is not equal to":
          if (value != answer) {
            hideQuestions = false;
          }
          break;

        case "is empty":
          if (!value || (value && value.length < 1)) {
            hideQuestions = false;
          }
          break;

        case "is not empty":
          if (value && value.length > 0) {
            hideQuestions = false;
          }
          break;

        case "is greater than":
          if ($.isNumeric(value) && parseFloat(value) > parseFloat(answer)) {
            hideQuestions = false;
          }
          break;

        case "is less than":
          if ($.isNumeric(value) && parseFloat(value) < parseFloat(answer)) {
            hideQuestions = false;
          }
          break;

        case "starts with":
          if (value && value.slice(0, answer.length) === answer) {
            hideQuestions = false;
          }
          break;

        case "contains":
          if (value && value.indexOf(answer) > -1) {
            hideQuestions = false;
          }
          break;
      }

      // Break out of loop if we found a match
      if (hideQuestions === false) {
        return hideQuestions;
      }
    }

    return hideQuestions;
  };

  ConditionalLogic.prototype.getValue = function($conditionElement) {
    var value, optionStrings, selected, text;

    // Check if element has selectize enabled
    if ($conditionElement[0] && $conditionElement[0].selectize) {
      value = $conditionElement[0].selectize.getValue();

      if (Array.isArray(value)) {
        optionStrings = [];
        $.each(value, function(index, optionId) {
          optionStrings.push($($conditionElement[0].selectize.getItem(optionId)[0]).text());
        });

        return optionStrings.join("|&|");
      } else {
        return $($conditionElement[0].selectize.getItem(value)[0]).text();
      }
    }

    // Handle radio buttons
    if ($conditionElement.is(":radio")) {
      selected = $("input[type='radio'][name='" + $conditionElement.attr('name') + "']:checked");
      if (selected.length > 0) {
        return selected.attr('data-label-value') ? selected.attr('data-label-value') : selected.val();
      } else {
        return;
      }
    }

    // Handle checkboxes inside checkbox groups
    if ($conditionElement.is(":checkbox") && $conditionElement.parents('.form-container-entry-item').data('element-type') === 'checkboxes') {
      optionStrings = [];
      $conditionElement.each(function(index, checkbox) {
        if ($(checkbox).is(":checked")) {
          optionStrings.push($(checkbox).attr('data-label-value'));
        }
      });
      return optionStrings.join("|&|");
    }

    // Handle individual checkboxes
    if ($conditionElement.is(":checkbox")) {
      if ($conditionElement.is(":checked")) {
        return $conditionElement.attr('data-label-value') ? $conditionElement.attr('data-label-value') : $conditionElement.val();
      } else {
        return;
      }
    }

    // Handle multiple select dropdowns
    if ($conditionElement.is('select[multiple]')) {
      if ($conditionElement.find("option:selected").length > 0) {
        optionStrings = [];
        $conditionElement.find("option:selected").each(function() {
          optionStrings.push(this.innerHTML);
        });
        return optionStrings.join("|&|");
      } else if ($conditionElement.is(".selectize-taxon-select") && $conditionElement.children().length > 0) {
        optionStrings = [];
        $conditionElement.children().each(function() {
          optionStrings.push(this.innerHTML);
        });
        return optionStrings.join("|&|");
      } else if ($conditionElement.is(".selectize-location-select") && $conditionElement.children().length > 0) {
        optionStrings = [];
        $conditionElement.children().each(function() {
          optionStrings.push(this.innerHTML);
        });
        return optionStrings.join("|&|");
      } else {
        return;
      }
    }

    // Handle single select dropdowns
    if ($conditionElement.is('select')) {
      text = $('#' + $conditionElement.attr('id') + ' option:selected').text();
      return text === 'Please select' ? undefined : text;
    }

    // Handle paragraph elements (remove carriage returns and trim whitespace)
    if ($conditionElement.is("p")) {
      return $conditionElement.text().replace(/\↵/g, "").trim();
    }

    // Handle survey report preview inside table cells
    if ($conditionElement.is('td')) {
      if ($conditionElement.hasClass('checklist')) {
        return $conditionElement.find('span.hidden-answer').text().replace(/\↵/g, '').trim();
      } else {
        return $conditionElement.text().replace(/\↵/g, '').trim();
      }
    }

    // Default case: return input value
    return $conditionElement.val();
  };

  ConditionalLogic.prototype.updateCalculation = function(rule, $ruleContainer) {
    var self = this;
    var parameters = {}; // Used to store the survey data object passed to the calculated fields expression
    var $target = $ruleContainer.find('.form-control'); // The question we are calculating a value for
    var $targetRepeater = $ruleContainer.closest(".form-container-repeater"); // The parent repeater of the target, if it exists
    var targetType = $ruleContainer.data('element-type'); // The form control type of the target

    // Cache all condition questions upfront
    var conditionQuestions = {};
    $.each(rule.conditions, function(index, condition) {
      var $question = $('[data-question-id="' + condition.question_id + '"]');
      conditionQuestions[condition.question_id] = {
        $element: $question,
        inRepeater: $question.closest(".form-container-repeater").length > 0
      };
    });

    $.each(rule.conditions, function(index, condition) {
      var $question, elementType, columnName, $repeater, value;
      var cachedQuestion = conditionQuestions[condition.question_id];

      // If the target question is inside a repeater AND the parameter question is inside a repeater,
      // we only want the parameter if it's in the same repeater instance as the target.
      if ($targetRepeater.length > 0 && cachedQuestion.inRepeater) {
        $question = $targetRepeater.find('[data-question-id="' + condition.question_id + '"]');
      } else {
        $question = cachedQuestion.$element;
      }

      elementType = $question.data('element-type'); // The form control type of the parameter question
      columnName = $question.data('api-column-name'); // The API column name of the parameter, used to generate the variable name
      $repeater = $question.closest(".form-container-repeater"); // The parent parameter of the target, if it exists

      // If the parameter question is inside a repeater, but the target is top-level,
      // we want to make an array out of the parameter question across all repeater instances.
      if ($repeater.length > 0 && $targetRepeater.length === 0) {
        var entries = [];
        var $conditionElements;
        
        // Handle radio buttons and select elements specially to avoid duplicates
        if (elementType === 'radio') {
          // For radio buttons, get unique groups by name attribute
          var radioNames = {};
          $question.find('.form-control[type="radio"]').each(function() {
            var name = $(this).attr('name');
            if (!radioNames[name]) {
              radioNames[name] = $(this);
            }
          });
          $conditionElements = $($.map(radioNames, function(element) { return element; }));
        } else if (elementType === 'select') {
          // For select elements, get the actual select element (not the Selectize wrapper)
          $conditionElements = $question.find('select.form-control');
        } else {
          $conditionElements = $question.find('.form-control');
        }
        
        $conditionElements.each(function(index, entry) {
          value = self.getNativeValue($(entry), elementType);
          entries.push(value);
        });
        parameters[columnName] = entries;
      } else {
        // Otherwise, we only want the parameter question (either it is top level, or in the same repeater instance as the target).
        var $conditionElement = $question.find('.form-control');
        value = self.getNativeValue($conditionElement, elementType);
        parameters[columnName] = value;
      }
    });

    self.interpreter = new Interpreter(rule.script, function(interpreter, globalObject) {
      // Creates a function that can be called from the interpreter context,
      // which allows us to extract the calculation result and update the UI.
      var outputWrapper = function(result) {
        self.setCalculationResult($target, result, targetType);
      };

      interpreter.setProperty(globalObject, 'setResult', interpreter.createNativeFunction(outputWrapper));

      // Get all of the parameter questions, inject them into the interpreter as $api_column_name variables.
      $.each(parameters, function(key, value) {
        // Ensure numeric values are properly typed for calculations
        if (typeof value === 'string' && $.isNumeric(value)) {
          value = parseFloat(value);
        }
        // Only extract single values from single-element arrays in large edit modal context
        // Regular edit top-level calculations need arrays even for single repeaters
        var isInLargeEditModal = $('#repeaterModal').length > 0 && ($('#repeaterModal').hasClass('in') || $('#repeaterModal').is(':visible'));
        // Alternative detection: check if we're inside the modal context
        var isInModalContext = $('.form-container-survey').closest('#repeaterModal').length > 0;
        // Check if we're on large edit page and in a modal context
        var isLargeEditPage = window.location.pathname.includes('/large_edit');
        var isInModal = $('#repeaterModal').length > 0;
        if ((isInLargeEditModal || isInModalContext || (isLargeEditPage && isInModal)) && Array.isArray(value) && value.length === 1) {
          value = value[0];
        }
        interpreter.setProperty(globalObject, '$' + key, interpreter.nativeToPseudo(value));
      });
    });

    self.interpreter.run();
  };

  ConditionalLogic.prototype.setCalculationResult = function($target, pseudoResult, elementType) {
    var self = this;
    var result = self.interpreter.pseudoToNative(pseudoResult); // Converts from an interpreter object to a native JS object
    var shouldTriggerChange = false;

    if (elementType === 'checkbox' && typeof result === 'boolean') {
      var currentValue = $target.prop("checked");
      if (currentValue !== result) {
        $target.prop("checked", result);
        shouldTriggerChange = true;
      }
    } else if ((elementType === 'number' || elementType === 'counter') && typeof result === 'number') {
      var currentValue = parseFloat($target.val());
      if (currentValue !== result) {
        $target.val(result);
        shouldTriggerChange = true;
      }
    } else if (elementType === 'text' || elementType === 'textarea' || elementType === 'time') {
      var currentValue = $target.val();
      if (currentValue !== result) {
        $target.val(result);
        shouldTriggerChange = true;
      }
    } else if (elementType === 'date' && typeof result === 'string') {
      var currentDate = $target.datepicker("getDate");
      var newDate = new Date(result);
      if (!currentDate || currentDate.getTime() !== newDate.getTime()) {
        $target.datepicker("setDate", newDate);
        shouldTriggerChange = true;
      }
    } else if (elementType === 'checkboxes' && Array.isArray(result)) {
      var $checkboxes = $target;
      $checkboxes.each(function(index, checkbox) {
        var $checkbox = $(checkbox);
        var currentValue = $checkbox.prop("checked");
        var newValue = result.indexOf($checkbox.attr('data-label-value')) !== -1;
        if (currentValue !== newValue) {
          $checkbox.prop("checked", newValue);
          shouldTriggerChange = true;
        }
      });
    } else if (elementType === 'multiselect' && Array.isArray(result)) {
      if ($target.hasClass('chosen-multiselect')) {
        var currentValues = $target.find('option:selected').map(function() { return $(this).text(); }).get();
        if (!_.isEqual(currentValues.sort(), result.sort())) {
          $target.find('option').prop('selected', false);
          $.each(result, function(index, optionText) {
            $target.find('option:contains(' + optionText + ')').prop('selected', true);
          });
          shouldTriggerChange = true;
        }
      } else if ($target.hasClass('selectized')) {
        var currentValues = $target[0].selectize.getValue();
        if (!_.isEqual(currentValues.sort(), result.sort())) {
          $target[0].selectize.clear(true);
          $.each($target[0].selectize.options, function(index, option) {
            if (result.indexOf(option.text) !== -1) {
              $target[0].selectize.addItem(option.value, false);
            }
          });
          shouldTriggerChange = true;
        }
      }
    } else if (elementType === 'select' && typeof result === 'string') {
      var currentValue = $target.find('option:selected').text();
      if (currentValue !== result) {
        if ($target.hasClass('chosen-select')) {
          $target.find('option').prop('selected', false);
          $target.find('option:contains(' + result + ')').prop('selected', true);
        } else if ($target.hasClass('selectized')) {
          $target[0].selectize.clear(true);
          $.each($target[0].selectize.options, function(index, option) {
            if (option.text === result) {
              $target[0].selectize.addItem(option.value, false);
              return false;
            }
          });
        }
        shouldTriggerChange = true;
      }
    } else if (elementType === 'radio' && typeof result === 'string') {
      var $radios = $target;
      var currentValue = $radios.filter(':checked').attr('data-label-value');
      if (currentValue !== result) {
        $radios.each(function(index, radio) {
          var $radio = $(radio);
          var newValue = $radio.attr('data-label-value') === result;
          if ($radio.prop("checked") !== newValue) {
            $radio.prop("checked", newValue);
            shouldTriggerChange = true;
          }
        });
      }
    } else {
      // If the type of the calculation result doesn't match the element type, or is null/undefined, clear the target
      if (elementType === 'checkbox') {
        if ($target.prop("checked")) {
          $target.prop("checked", false);
          shouldTriggerChange = true;
        }
      } else if (elementType === 'checkboxes' || elementType === 'radio') {
        var hasChecked = false;
        $.each($target, function(index, option) {
          if ($(option).prop("checked")) {
            $(option).prop("checked", false);
            hasChecked = true;
          }
        });
        shouldTriggerChange = hasChecked;
      } else if (elementType === 'multiselect' || elementType === 'select') {
        if ($target.hasClass('chosen-select') || $target.hasClass('chosen-multiselect')) {
          if ($target.find('option:selected').length > 0) {
            $target.find('option').prop('selected', false);
            shouldTriggerChange = true;
          }
        } else if ($target.hasClass('selectized')) {
          if ($target[0].selectize.getValue().length > 0) {
            $target[0].selectize.clear(true);
            shouldTriggerChange = true;
          }
        }
      } else {
        if ($target.val() !== '') {
          $target.val('');
          shouldTriggerChange = true;
        }
      }
    }

    // Only trigger change events if the value actually changed
    if (self.allowCascade && shouldTriggerChange) {
      if (elementType === 'checkboxes' || elementType === 'radio') {
        $.each($target, function(index, checkbox) {
          $(checkbox).trigger('change');
        });
      } else if (elementType === 'multiselect' || elementType === 'select') {
        if ($target.hasClass('chosen-select') || $target.hasClass('chosen-multiselect')) {
          $target.trigger("chosen:updated");
        } else if ($target.hasClass('selectized')) {
          $($target[0]).trigger('change');
        }
      } else {
        $target.trigger('change');
      }
    }
  };

  ConditionalLogic.prototype.getNativeValue = function($input, elementType) {
    var self = this;
    var stringValue = self.getValue($input);

    if (elementType === 'checkbox') {
      return stringValue === 'true';
    }

    if (elementType === 'number' || elementType === 'counter') {
      return $.isNumeric(stringValue) ? parseFloat(stringValue) : 0;
    }

    if (elementType === 'multiselect' || elementType === 'checkboxes') {
      if (stringValue === undefined || stringValue === null || stringValue.trim() === '') {
        return [];
      } else {
        return stringValue.split('|&|');
      }
    }

    if (elementType === 'date') {
      return $input.datepicker('getDate');
    }

    if (stringValue === undefined || stringValue === null || stringValue.trim() === '') {
      return null;
    }

    return stringValue;
  };

  // Add: Only bind event handlers, do not run/hide/show anything
  ConditionalLogic.prototype.bindConditionalLogic = function($context) {
    var self = this;
    $context.find("[data-rule!=''][data-rule]").each(function() {
      var $ruleContainer = $(this);
      var rules = $.parseJSON($ruleContainer.attr("data-rule"));
      $(rules).each(function() {
        var rule = this;
        $(rule.conditions).each(function() {
          var conditionQuestionId = this.question_id;
          var $conditionContainer = $ruleContainer.siblings("[data-question-id=" + conditionQuestionId + "]");
          if ($conditionContainer.length < 1) {
            $conditionContainer = $("[data-question-id=" + conditionQuestionId + "]");
          }
          var $conditionElement = $conditionContainer.find(".form-control");
          if ($conditionElement.length < 1) {
            $conditionElement = $conditionContainer.find(".form-control-static");
          }
          var ancestorId = rule.question_id;
          if ($conditionElement.length < 2) {
            self.bindConditions($conditionElement, rule, $ruleContainer, this.id);
          } else {
            if ($conditionElement.is(":checkbox")) {
              if (rule.type !== 'Hanuman::CalculationRule') {
                $conditionElement = $conditionContainer.find(".form-control[data-label-value='" + this.answer.replace("/", "\\/").replace("'", "\\'") + "']");
              }
              self.bindConditions($conditionElement, rule, $ruleContainer, this.id);
            } else {
              $conditionElement.each(function(index, element) {
                self.bindConditions($(element), rule, $ruleContainer, this.id);
              });
            }
          }
        });
      });
    });
  };

  // Add: Only run/hide/show logic, do not bind events
  ConditionalLogic.prototype.runConditionalLogic = function(runCalcs, runConditionals, $context) {
    var self = this;
    $context.find("[data-rule!=''][data-rule]").each(function() {
      var $ruleContainer = $(this);
      var rules = $.parseJSON($ruleContainer.attr("data-rule"));
      $(rules).each(function() {
        var rule = this;
        var matchType = rule.match_type;
        $(rule.conditions).each(function() {
          var inRepeater = false;
          var $conditionContainer = $ruleContainer.siblings("[data-question-id=" + this.question_id + "]");
          if ($conditionContainer.length < 1) {
            $conditionContainer = $("[data-question-id=" + this.question_id + "]");
          }
          var $conditionElement = $conditionContainer.find(".form-control");
          if ($conditionElement.length < 1) {
            $conditionElement = $conditionContainer.find(".form-control-static");
          }
          var $repeater = $conditionElement.closest(".form-container-repeater");
          if ($repeater.length > 0) {
            inRepeater = true;
          }
          var ancestorId = rule.question_id;
          if (rule.type !== "Hanuman::CalculationRule") {
            if (runConditionals) {
              self.checkConditionsAndHideShow(rule.conditions, ancestorId, $ruleContainer, $ruleContainer, inRepeater, matchType, rule, true);
            }
          }
        });
        if (runCalcs && rule.type === "Hanuman::CalculationRule") {
          self.updateCalculation(rule, $ruleContainer);
        }
      });
    });
  };

  // Update: findRules now just calls both for backward compatibility
  ConditionalLogic.prototype.findRules = function(runCalcs, runConditionals, $context) {
    this.bindConditionalLogic($context);
    this.runConditionalLogic(runCalcs, runConditionals, $context);
  };

  // Update: on document ready, call only bindConditionalLogic for large_edit, both for normal edit
  $(function() {
    var $context = $('.form-container-survey');
    var isLargeEdit = window.location.pathname.includes('large_edit');
    if ($('input#run_cl').length || isLargeEdit) {
      var cl = new ConditionalLogic();
      if (isLargeEdit) {
        cl.bindConditionalLogic($context);
      } else {
        cl.findRules(false, true, $context);
      }
    }
  });

  this.ConditionalLogic = ConditionalLogic;
})();