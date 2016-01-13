$ ->

  #scan page and find all objects with data rules
  findDataRules = ->
    $("[data-rule]").each ->
      rule = $.parseJSON($(this).attr("data-rule")).rule
      $(rule.conditions).each ->
        bindConditions(rule.hidden, rule.question_id, this.question_id, this.operator, this.answer)

  #todo when implementing d
  #bind conditions to question
  bindConditions = (hidden, ancestor_id, question_id, operator, answer) ->
    $("[data-question-id=" + question_id + "]").on "change", ->
      hide_questions = true
      i = 0
      while i < 2
        if i < 1
          switch operator
            when "is equal to"
              if $(this).val() == answer then hide_questions = false
            when "is not equal to"
              if $(this).val() != answer then hide_questions = false
            when "is empty"
              if $(this).val().length < 1 then hide_questions = false
            when "is not empty"
              if $(this).val().length > 0 then hide_questions = false
            when "is greater than"
              if $.isNumeric($(this).val())
                if $(this).val() > answer then hide_questions = false
            when "is less than"
              if $.isNumeric($(this).val())
                if $(this).val() < answer then hide_questions = false
            when "starts with"
              if $(this).val().slice(0, answer.length) == answer then hide_questions = false
            when "contains"
              if $(this).val().indexOf(answer) > -1 then hide_questions = false
        else
          hideShowQuestions(hidden, hide_questions, ancestor_id)
        i++

  #hide or show questions
  # when hide_questions is true we don't want to hide
  hideShowQuestions = (hidden, hide_questions, ancestor_id) ->
    selection = $("[data-question-id=" + ancestor_id + "],[data-ancestor=" + ancestor_id + "]").closest(".form-entry-item-container")
    if hide_questions then selection.addClass("conditional-logic-hidden") else selection.removeClass("conditional-logic-hidden")

  #call findDataRules on document ready
  findDataRules()
