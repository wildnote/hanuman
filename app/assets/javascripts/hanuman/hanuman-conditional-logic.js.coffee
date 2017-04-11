class @ConditionalLogic

  self = ConditionalLogic.prototype

  #scan page and find all objects with conditional logic rules
  findRules: ->
    $("[data-rule!=''][data-rule]").each ->
      $ruleContainer = $(this)
      #if $ruleElement.attr('data-rule').length > 0
      rule = $.parseJSON($ruleContainer.attr("data-rule")).rule_hash
      matchType = rule.match_type
      #console.log rule
      $(rule.conditions).each ->
        condition = this
        conditionQuestionId = condition.question_id
        # the container for the rule element(s), could be a single element contained in form-container-entry-item or multiple in form-container-repeater
        $ruleContainer = $ruleContainer
        # the condition container
        $conditionContainer = $ruleContainer.siblings("[data-question-id=" + conditionQuestionId + "]")

        # if condition is outside of $ruleContainer siblings context, let's looks for it globally
        if $conditionContainer.length < 1
          $conditionContainer = $("[data-question-id=" + conditionQuestionId + "]")

        #TODO add some kind of message to the user and honeybadger notification so that we know the rule is not working on the web


        # the condition element, which we need to check value for conditional logic
        $conditionElement = $conditionContainer.find(".form-control")
        # show
        if $conditionElement.length < 1
          $conditionElement = $conditionContainer.find(".form-control-static")

        # deal with any condition, once we get a hide_questions = false then we dont need to run through the rules
        hideQuestions = self.evaluateCondition(condition.operator, condition.answer, self.getValue($conditionElement))

        ancestorId = rule.question_id
        # bind conditions based on element type
        # text, textarea, select
        if $conditionElement.length < 2
          self.bindConditions($conditionElement)
        # radio buttons
        else
          if $conditionElement.is(":checkbox")
            # limit binding of each checkbox if data-label-value and answer are the same-kdh
            $conditionElement = $conditionContainer.find(".form-control[data-label-value='" + condition.answer.replace("/","\\/") + "']")
            self.bindConditions($conditionElement)
          else
            for element in $conditionElement
              do (element) ->
                self.bindConditions($(element))

        #TODO CLEAN UP THIS CODE WE HAVE STUFF IN HERE WE ARE NOT USING LIKE inRepeater
        # determine if we are in a repeater-this needs to get deleted-kdh
        inRepeater = false
        $repeater = $conditionElement.closest(".form-container-repeater")
        if $repeater.length > 0
            inRepeater = true
        if rule.conditions.length > 1
          self.checkConditionsAndHideShow(rule.conditions, ancestorId, $ruleContainer, $ruleContainer, inRepeater, matchType)
        else
          self.hideShowQuestions(hideQuestions, ancestorId, $ruleContainer, $ruleContainer, inRepeater)
    return

  #bind conditions to question
  bindConditions: ($triggerElement) ->
    $triggerElement.on "change", ->
      # pop out of condition into rules to handle all conditions defined in the rule
      # TODO it seems this is looping through ALL data-rule in the DOM instead of the data-rule associated with the element that triggered the onchange event-kdh
      $repeater = $($triggerElement).closest(".form-container-repeater")
      # check first to see if this bind is in a repeater
      if $repeater.length > 0
        $repeater.find("[data-rule!=''][data-rule]").each ->
          inRepeater = true
          $ruleElement = $(this)
          #$container = $(this).closest(".form-container-repeater")
          $container = $ruleElement
          rule = $.parseJSON($ruleElement.attr("data-rule")).rule_hash
          matchType = rule.match_type
          questionId = $triggerElement.closest('.form-container-entry-item').attr('data-question-id')
          conditions = rule.conditions
          ancestorId = rule.question_id
          matchingCondition = _.where(conditions, {question_id: Number(questionId)})
          if matchingCondition.length > 0
            if conditions.length > 1
              self.checkConditionsAndHideShow(conditions, ancestorId, $ruleElement, $container, inRepeater, matchType)
            else
              operator = conditions[0].operator
              answer = conditions[0].answer
              hideQuestions = self.evaluateCondition(operator, answer, self.getValue($triggerElement))
              self.hideShowQuestions(hideQuestions, ancestorId, $ruleElement, $container, inRepeater)
      # if not then lets assume its at the top most level outside of a repeater
      else
        $($triggerElement).closest(".form-container-survey").find("[data-rule!=''][data-rule]").each ->
          inRepeater = false
          $ruleElement = $(this)
          #$container = $(this).closest(".form-container-survey")
          $container = $ruleElement
          rule = $.parseJSON($ruleElement.attr("data-rule")).rule_hash
          matchType = rule.match_type
          questionId = $triggerElement.closest('.form-container-entry-item').attr('data-question-id')
          conditions = rule.conditions
          ancestorId = rule.question_id
          matchingCondition = _.where(conditions, {question_id: Number(questionId)})
          if matchingCondition.length > 0
            if conditions.length > 1
              self.checkConditionsAndHideShow(conditions, ancestorId, $ruleElement, $container, inRepeater, matchType)
            else
              operator = conditions[0].operator
              answer = conditions[0].answer
              hideQuestions = self.evaluateCondition(operator, answer, self.getValue($triggerElement))
              self.hideShowQuestions(hideQuestions, ancestorId, $ruleElement, $container, inRepeater)
    return

  checkConditionsAndHideShow: (conditions, ancestorId, $ruleElement, $container, inRepeater, matchType) ->
    conditionMetTracker = []
    $.each conditions, (index, condition) ->
      if inRepeater
        $conditionElement = $container.parents(".form-container-repeater").find("[data-question-id=" + condition.question_id + "]").find('.form-control')
        if $conditionElement.length < 1
          $conditionElement = $container.parents(".form-container-repeater").find("[data-question-id=" + condition.question_id + "]").find('.form-control-static')
      else
        $conditionElement = $("[data-question-id=" + condition.question_id + "]").find('.form-control')
        if $conditionElement.length < 1
          $conditionElement = $("[data-question-id=" + condition.question_id + "]").find('.form-control-static')

      if $conditionElement.is(":checkbox")# || $triggerElement.is(":radio"))
        # limit binding of each checkbox if data-label-value and answer are the same-kdh
        $conditionElement = $conditionElement.closest('.form-container-entry-item').find(".form-control[data-label-value='" + condition.answer.replace("/","\\/") + "']")
      hideQuestions = self.evaluateCondition(condition.operator, condition.answer, self.getValue($conditionElement))
      conditionMet = !hideQuestions
      conditionMetTracker.push conditionMet
    # match type any (or)
    if matchType == "any"
      if conditionMetTracker.indexOf(true) > -1
        hideShow = false
      else
        hideShow = true
    # match type all
    if matchType == "all"
      if conditionMetTracker.indexOf(false) == -1
        # if no false in the array then show the conditional logic
        hideShow = false
      else
        # if one false then hide the conditioanl logic
        hideShow = true
    self.hideShowQuestions(hideShow, ancestorId, $ruleElement, $container, inRepeater)


  #hide or show questions
  hideShowQuestions: (hide_questions, ancestor_id, $ruleElement, $container, inRepeater) ->
    #all_questions = $($container).find(".form-container-repeater[data-question-id=" + ancestor_id + "][data-entry=],[data-question-id=" + ancestor_id + "],[data-ancestor=" + ancestor_id + "]")

    # deal with container
    #unless $container.hasClass("form-container-survey")
    if hide_questions
      $container.addClass("conditional-logic-hidden")
      self.clearQuestions($container)
    else
      $container.removeClass("conditional-logic-hidden")

    # deal with questions
    # if hide_questions
    #   all_questions.addClass("conditional-logic-hidden")
    #   self.clearQuestions(all_questions)
    # else
    #   all_questions.removeClass("conditional-logic-hidden")

  #clear questions
  clearQuestions: (container) ->
    #console.log container
    # clear out text fields, selects and uncheck radio and checkboxes
    #TODO set these to default values once we implement default values - kdh
    # container.find("input[type!=hidden]").val("")
    textFields = container.find(":text").val("")
    textAreas = container.find("textarea").val("")
    # un-select dropdown
    selects = container.find("select")
    selects.each ->
      $(this).val("")
      $(this).trigger("chosen:updated") if $(this).hasClass('chosen')
    multiselects = container.find("select[multiple]")
    multiselects.each ->
      id = $(this).attr('id')
      $('#' + id + ' option:selected').removeAttr("selected")
      $(this).trigger("chosen:updated") if $(this).hasClass('chosen-multiselect')
    # uncheck all checkboxes
    checkboxes = container.find(":checkbox")
    checkboxes.each ->
      $(this).prop('checked', false)
    # un-select radio buttons
    radiobuttons = container.find(":radio")
    radiobuttons.each ->
      $(this).prop('checked', false)
    # trigger onchange event which is needed for embedded conditional logic
    container.find('.form-control').trigger('change')

  #evaluate conditional logic rules
  evaluateCondition: (operator, answer, value) ->
    hide_questions = true
    switch operator
      when "is equal to"
        if value == answer then hide_questions = false
      when "is not equal to"
        if value != answer then hide_questions = false
      when "is empty"
        if value.length < 1 then hide_questions = false
      when "is not empty"
        if value.length > 0 then hide_questions = false
      when "is greater than"
        if $.isNumeric(value)
          if parseFloat(value) > parseFloat(answer) then hide_questions = false
      when "is less than"
        if $.isNumeric(value)
          if parseFloat(value) < parseFloat(answer) then hide_questions = false
      when "starts with"
        if value and value.slice(0, answer.length) == answer then hide_questions = false
      when "contains"
        if value and value.indexOf(answer) > -1 then hide_questions = false
    return hide_questions

  # get value of triggering question
  getValue: ($conditionElement) ->
    if $conditionElement.is(":radio")
      selected = $("input[type='radio'][name='" + $conditionElement.attr('name') + "']:checked")
      if selected.length > 0
        if selected.attr('data-label-value')
          return selected.attr('data-label-value')
        else
          return selected.val()
      else
        return
    if $conditionElement.is(":checkbox")
      if $conditionElement.is(":checked")
        if $conditionElement.attr('data-label-value')
          return $conditionElement.attr('data-label-value')
        else
          return $conditionElement.val()
      else
        return
    if $conditionElement.is('select[multiple]')
      if $('#' + $conditionElement.attr('id') + ' option:selected').size() > 0
        option_strings = []
        $('#' + $conditionElement.attr('id') + ' option:selected').each ->
          option_strings.push this.innerHTML
        return option_strings.join(", ")
      else
        return
    if $conditionElement.is('select')
      return $('#' + $conditionElement.attr('id') + ' option:selected').text()
    if $conditionElement.is("p")
      #remove carriage returns and trim leading and trailing whitespace
      #need to refactor to look for value in element data- attribute instead of from html rendered output
      return $conditionElement.text().replace(/\↵/g,"").trim()
    # survey report preview
    if $conditionElement.is('td')
      return $conditionElement.text().replace(/\↵/g, "").trim()
    $conditionElement.val()

$ ->
  #call findRules on document ready
  cl = new ConditionalLogic
  cl.findRules()
