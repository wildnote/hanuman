$ ->

  #scan page and find all objects with data rules
  findDataRules = ->
    $("[data-rule]").each ->
      rule = $.parseJSON($(this).attr("data-rule")).rule
      $(rule.conditions).each ->
        bindConditions(rule.hidden, rule.question_id, this.question_id, this.operator, this.answer)

  #bind conditions to question
  bindConditions = (hidden, ancestor_id, question_id, operator, answer) ->
    $("[data-question-id=" + question_id + "]").on "change", ->
      logic_result = false
      i = 0
      while i < 2
        if i < 1
          switch operator
            when "is equal to"
              if $(this).val() == answer then logic_result = true
            when "is not equal to"
              if $(this).val() != answer then logic_result = true
            when "is empty"
              if $(this).val().length < 1 then logic_result = true
            when "is not empty"
              if $(this).val().length > 0 then logic_result = true
            when "is greater than"
              if $.isNumeric($(this).val())
                if $(this).val() > answer then logic_result = true
            when "is less than"
              if $.isNumeric($(this).val())
                if $(this).val() < answer then logic_result = true
            when "starts with"
              if $(this).val().slice(0, answer.length) == answer then logic_result = true
            when "contains"
              if $(this).val().indexOf(answer) > -1 then logic_result = true
        else
          hideShowQuestions(hidden, logic_result, ancestor_id)
        i++

  #hide or show questions
  hideShowQuestions = (hidden, logic_result, ancestor_id) ->
    selection = $("[data-question-id=" + ancestor_id + "],[data-ancestor=" + ancestor_id + "]").closest(".form-entry-item-container")
    if hidden
      if logic_result then selection.addClass("conditional-logic-hidden") else selection.removeClass("conditional-logic-hidden")
    else
      if logic_result then selection.removeClass("conditional-logic-hidden") else selection.addClass("conditional-logic-hidden")

  #call findDataRules on document ready
  findDataRules()
