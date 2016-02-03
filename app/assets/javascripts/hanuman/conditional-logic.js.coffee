class ConditionalLogic

  self = ConditionalLogic.prototype

  #scan page and find all objects with conditional logic rules
  findRules: ->
    $("[data-rule]").each ->
      $ruleElement = $(this)
      if $ruleElement.attr('data-rule').length > 0
        rule = $.parseJSON($ruleElement.attr("data-rule")).rule
        matchType = rule.match_type
        #console.log rule
        $(rule.conditions).each ->
          condition = this
          #console.log condition
          questionId = condition.question_id
          $triggerContainer = $("[data-question-id=" + questionId + "]")
          $triggerElement = $triggerContainer.find(".form-control")
          # deal with any condition, once we get a hide_questions = false then we don't need to run through the rules
          hideQuestions = self.evaluateCondition(condition.operator, condition.answer, self.getValue($triggerElement))
          ancestorId = rule.question_id
          # text, textarea, select
          if $triggerElement.length < 2
            #self.setDefaultState(rule.question_id, $triggerElement, condition.operator, condition.answer)
            self.hideShowQuestions(hideQuestions, ancestorId)
            self.bindConditions(rule.question_id, $triggerElement, condition.operator, condition.answer)
          # radio buttons
          else
            if $triggerElement.is(":checkbox")
              # limit binding of each checkbox if data-label-value and answer are the same-kdh
              $triggerElement = $triggerContainer.find(".form-control[data-label-value=" + condition.answer + "]")
              self.hideShowQuestions(hideQuestions, ancestorId)
              self.bindConditions(rule.question_id, $triggerElement, condition.operator, condition.answer)
            else
              for element in $triggerElement
                do (element) ->
                  #self.setDefaultState(rule.question_id, $(element), condition.operator, condition.answer)
                  self.hideShowQuestions(hideQuestions, ancestorId)
                  self.bindConditions(rule.question_id, $(element), condition.operator, condition.answer)
          # deal with any condition, once we get a hide_questions = false then we don't need to run through the rules
          if matchType == "any" and hideQuestions == false
            console.log "let's break out of this joint"

    return

  # set the default hide show conditions
  setDefaultState: (ancestor_id, $triggerElement, operator, answer) ->
    self.hideShowQuestions(self.evaluateCondition(operator, answer, self.getValue($triggerElement)), ancestor_id)

  #bind conditions to question
  bindConditions: (ancestor_id, $triggerElement, operator, answer) ->
    $triggerElement.on "change", ->
      self.hideShowQuestions(self.evaluateCondition(operator, answer, self.getValue($triggerElement)), ancestor_id)
    return

  #hide or show questions
  hideShowQuestions: (hide_questions, ancestor_id) ->
    container = $("[data-question-id=" + ancestor_id + "],[data-ancestor=" + ancestor_id + "]").closest(".form-entry-item-container")
    if hide_questions
      container.addClass("conditional-logic-hidden")
      self.clearQuestions(container)
    else
      container.removeClass("conditional-logic-hidden")

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
      $('#' + $this.attr('id') + ' option:selected').removeAttr("selected")
      $(this).trigger("chosen:updated") if $(this).hasClass('chosen-multiselect')
    # uncheck all checkboxes
    checkboxes = container.find(":checkbox")
    checkboxes.each ->
      $(this).prop('checked', false)
    # un-select radio buttons
    radiobuttons = container.find(":radio")
    radiobuttons.each ->
      $(this).prop('checked', false)

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
          if value > answer then hide_questions = false
      when "is less than"
        if $.isNumeric(value)
          if value < answer then hide_questions = false
      when "starts with"
        if value and value.slice(0, answer.length) == answer then hide_questions = false
      when "contains"
        if value and value.indexOf(answer) > -1 then hide_questions = false
    return hide_questions

  # get value of triggering question
  getValue: ($conditionElement) ->
    if $conditionElement.is(":radio")
      if $conditionElement.is(":checked")
        return $conditionElement.val()
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
    $conditionElement.val()

$ ->
  #call findRules on document ready
  cl = new ConditionalLogic
  cl.findRules()
