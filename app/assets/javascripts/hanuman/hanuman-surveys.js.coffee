$ ->
  if $(".panel-observation").length > 0
    $(".panel-observation").each( (index, element) ->
        question_id = $(element).attr('data-question-id');
        $(element).find('.panel-heading.chevron').attr("data-target", "#collapse_" + question_id + "_" + (index + 1))
        $(element).find('.panel-collapse.in').attr("id", "collapse_" + question_id + "_" + (index + 1))
      )

  # TYPEAHEAD
  if $(".typeahead").length > 0
    $(".typeahead").each ->
      questionId = $(@).data 'question-id'
      url = "/hanuman/answer_choices.json?question_id=" + questionId
      # instantiate bloodhound engine
      taxonomy = new Bloodhound(
        name: "taxonomy"
        #local: [{"id":22,"optionText":"Adoxaceae","scientificText":null},{"id":42,"optionText":"Agavaceae","scientificText":null},{"id":913,"optionText":"Allen's hummingbird","scientificText":"Selasphorus sasin"},{"id":230,"optionText":"Alliaceae","scientificText":null},{"id":914,"optionText":"American coot","scientificText":"Fulica americana"},{"id":915,"optionText":"American crow","scientificText":"Corvus brachyrhynchos"},{"id":916,"optionText":"American goldfinch","scientificText":"Carduelis tristis"},{"id":917,"optionText":"American kestrel","scientificText":"Falco sparverius"},{"id":918,"optionText":"American robin","scientificText":"Turdus migratorius"},{"id":919,"optionText":"American wigeon","scientificText":"Anas amercana"},{"id":895,"optionText":"Amphibians","scientificText":null},{"id":25,"optionText":"Anacardiaceae","scientificText":null},{"id":920,"optionText":"Anna's hummingbird","scientificText":"Calypte anna"},{"id":99,"optionText":"Apiaceae","scientificText":null},{"id":407,"optionText":"Apocynaceae","scientificText":null},{"id":1097,"optionText":"Aquatic garter snake","scientificText":"Thamnophis aquaticus"},{"id":63,"optionText":"Araliaceae","scientificText":null},{"id":921,"optionText":"Ash-throated flycatcher","scientificText":"Myiarchus cinerascens"},{"id":32,"optionText":"Asteraceae","scientificText":null},{"id":1055,"optionText":"Audubon's cottontail","scientificText":"Sylvilagus audubonii"},{"id":922,"optionText":"Band-tailed pigeon","scientificText":"Columbia fasciata"},{"id":923,"optionText":"Barn owl","scientificText":"Tyto alba"},{"id":924,"optionText":"Barn swallow","scientificText":"Hirundo rustica"},{"id":925,"optionText":"Belted kingfisher","scientificText":"Ceryle alcyon"},{"id":389,"optionText":"Bermuda buttercup","scientificText":"Oxalis pes-caprae"},{"id":196,"optionText":"Bermuda grass","scientificText":"Cynodon dactylon"},{"id":61,"optionText":"Betulaceae","scientificText":null}]
        prefetch: url
        #remote: "/hanuman/answerChoices.json?question_id=7"
        datumTokenizer: (d) ->
          Bloodhound.tokenizers.whitespace d.formatted_answer_choice

        queryTokenizer: Bloodhound.tokenizers.whitespace
      )
      # initialize the bloodhound suggestion engine
      promise = taxonomy.initialize()

      promise
      .done ->
        console.log 'success!'
      .fail ->
        console.log 'err!'

      $(@).typeahead(
        hint: true
        highlight: true
        minLength: 1
      ,
        name: "taxonomy"
        displayKey: "formatted_answer_choice"
        source: taxonomy.ttAdapter()
      )

    # custom event to capture answer_choice_id
    $(".typeahead").bind "typeahead:selected", (obj, datum, name) ->
      # set answer_choice_id from typeahead selected datum object
      $('#' + this.id + '_choice_id').val(datum['id'])

    $(".typeahead").bind "typeahead:autocompleted", (obj, datum, name) ->
      # set answer_choice_id from typeahead selected datum object
      $('#' + this.id + '_choice_id').val(datum['id'])

    # clear out answer_choice_id setting if user changes typeahead selection
    $(".typeahead").change ->
      $('#' + this.id + '_choice_id').val('')

  # outputs, e.g., "my_dataset"

  # END TYPEAHEAD


  # CHOSEN SINGLE SELECT
  # $(".chosen-select").prepend("<option value=''>&nbsp;</option>");
  $(".chosen-select").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"
    single_backstroke_delete: false
    search_contains: true
    
  

  # CHOSEN MULTISELECT
  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"
    single_backstroke_delete: false
    search_contains: true

  # END CHOSEN

  # Disable calculated fields
  $('.chosen-multiselect[readonly], .chosen-select[readonly]').parent().find('.chosen-container').css({'pointer-events': 'none','opacity': 0.5});

  # AJAX UPDATE FROM STEP_2
  $('.ajax-submit').on 'click', (e) ->
    e.preventDefault()
    $form = $('form')
    survey_id = $('#survey_id').val()
    l = Ladda.create this
    $.ajax(
      type:     "PUT"
      url:      "/hanuman/surveys/" + survey_id,
      data:     $form.serialize(),
      dataType: "json",
      success: (response) ->
        # clear previous entry highlighting
        $('.panel-body.bg-success').removeClass('bg-success')
        $('.form-group.bg-success').removeClass('bg-success')

        # determine response count
        responseCount = response.length

        # if we have more than one response object, meaning more than one field in the response?-kdh
        if responseCount > 1
          # create a collapsible panel
          panel = HandlebarsTemplates['surveys/panel'](response[0])
          # check to see if any panels already exist
          if $(".panel-collapse").length > 0
            # hide all existing panels
            $('.panel-collapse').collapse()
            # create next panel after last existing panel
            $(panel).insertAfter($(".panel").last())
          else
            # create first panel after last static row
            $(panel).insertAfter($('.form-control-static').last().closest('.form-group'))
          # add observation to end of observation section
          for observation in response
            do (observation) ->
              # check for collapsible panel presense
              if $(".panel-collapse").length > 0
                # if so render observation template inside last collapsible panel
                newRow = HandlebarsTemplates['surveys/observation'](observation)
                $('.panel-body').last().append(newRow)
              else
                # if not render observation template after the last static row
                newRow = HandlebarsTemplates['surveys/observation'](observation)
                $(newRow).insertAfter($('.form-control-static').last().closest('.form-group'))
        else
          # add observation to end of the last collapsible panel or form group with a form control static
          for observation in response
            do (observation) ->
              newRow = HandlebarsTemplates['surveys/observation'](observation)
              $(newRow).insertAfter($('.panel, .form-control-static').not('.panel .form-control-static').last().closest('.panel, .form-group'))

        # reset save button
        l.stop()

        # clear out observation field(s)
        $('input[type!=hidden][type!=radio][type!=submit]').val("")
        $('input[type=radio]').attr('checked', false)
        $('select[multiple!=multiple]').each ->
          this.selectedIndex = 0
        $('.search-choice-close').click()

    ).fail (jqXHR, textStatus, errorThrown) ->
      errorRow = HandlebarsTemplates['surveys/error'](errorThrown)
      $(errorRow).insertAfter($('.form-control-static').last().closest('.form-group'))
      # todo add honeybadger notification
