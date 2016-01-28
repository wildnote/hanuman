class ConditionalLogic

  self = ConditionalLogic.prototype

  #scan page and find all objects with conditional logic rules
  findRules: ->
    $("[data-rule]").each ->
      if $(this).attr('data-rule').length > 0
        rule = $.parseJSON($(this).attr("data-rule")).rule
        console.log rule 
        $(rule.conditions).each ->
          self.setDefaultState(rule.question_id, this.question_id, this.operator, this.answer)
          self.bindConditions(rule.question_id, this.question_id, this.operator, this.answer)
    return

  # set the default hide show conditions
  setDefaultState: (ancestor_id, question_id, operator, answer) ->
    self.hideShowQuestions(self.evaluateRules(operator, answer, $("[data-question-id=" + question_id + "]").val()), ancestor_id)

  #bind conditions to question
  bindConditions: (ancestor_id, question_id, operator, answer) ->
    $("[data-question-id=" + question_id + "]").on "change", ->
      self.hideShowQuestions(self.evaluateRules(operator, answer, $(this).val()), ancestor_id)
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
    container.find("input[type!=hidden]").val("")

  #evaluate conditional logic rules
  evaluateRules: (operator, answer, value) ->
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
        if value.slice(0, answer.length) == answer then hide_questions = false
      when "contains"
        if value.indexOf(answer) > -1 then hide_questions = false
    return hide_questions

$ ->
  #call findRules on document ready
  cl = new ConditionalLogic
  cl.findRules()
