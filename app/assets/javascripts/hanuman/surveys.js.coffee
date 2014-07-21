# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  # webshim lib polyfill
  webshims.setOptions "forms-ext",
    date:
      startView: 2
      openOnFocus: true
      popover:
        appendTo: "body"

    "datetime-local":
      startView: 3
      openOnFocus: true
      popover:
        appendTo: "body"

  webshims.polyfill "forms forms-ext"

  # TYPEAHEAD

  if $(".typeahead").length > 0
    # instantiate bloodhound engine
    taxonomy = new Bloodhound(
      name: "taxonomy"
      #local: [{"id":22,"option_text":"Adoxaceae","scientific_text":null},{"id":42,"option_text":"Agavaceae","scientific_text":null},{"id":913,"option_text":"Allen's hummingbird","scientific_text":"Selasphorus sasin"},{"id":230,"option_text":"Alliaceae","scientific_text":null},{"id":914,"option_text":"American coot","scientific_text":"Fulica americana"},{"id":915,"option_text":"American crow","scientific_text":"Corvus brachyrhynchos"},{"id":916,"option_text":"American goldfinch","scientific_text":"Carduelis tristis"},{"id":917,"option_text":"American kestrel","scientific_text":"Falco sparverius"},{"id":918,"option_text":"American robin","scientific_text":"Turdus migratorius"},{"id":919,"option_text":"American wigeon","scientific_text":"Anas amercana"},{"id":895,"option_text":"Amphibians","scientific_text":null},{"id":25,"option_text":"Anacardiaceae","scientific_text":null},{"id":920,"option_text":"Anna's hummingbird","scientific_text":"Calypte anna"},{"id":99,"option_text":"Apiaceae","scientific_text":null},{"id":407,"option_text":"Apocynaceae","scientific_text":null},{"id":1097,"option_text":"Aquatic garter snake","scientific_text":"Thamnophis aquaticus"},{"id":63,"option_text":"Araliaceae","scientific_text":null},{"id":921,"option_text":"Ash-throated flycatcher","scientific_text":"Myiarchus cinerascens"},{"id":32,"option_text":"Asteraceae","scientific_text":null},{"id":1055,"option_text":"Audubon's cottontail","scientific_text":"Sylvilagus audubonii"},{"id":922,"option_text":"Band-tailed pigeon","scientific_text":"Columbia fasciata"},{"id":923,"option_text":"Barn owl","scientific_text":"Tyto alba"},{"id":924,"option_text":"Barn swallow","scientific_text":"Hirundo rustica"},{"id":925,"option_text":"Belted kingfisher","scientific_text":"Ceryle alcyon"},{"id":389,"option_text":"Bermuda buttercup","scientific_text":"Oxalis pes-caprae"},{"id":196,"option_text":"Bermuda grass","scientific_text":"Cynodon dactylon"},{"id":61,"option_text":"Betulaceae","scientific_text":null}]
      prefetch: "/hanuman/answer_choices.json?question_id=7"
      #remote: "/hanuman/answer_choices.json?question_id=7"
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

    # instantiate the typeahead ui
    $(".typeahead").typeahead(
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

  # outputs, e.g., "my_dataset"

  # END TYPEAHEAD


  # CHOSEN
  $(".chosen-select").chosen
    no_results_text: "No results matched"
    size: "100%"

  # chosen multiselect
  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"
    size: "100%"

  # END CHOSEN


  # AJAX UPDATE FROM STEP_2
  $('.ajax-submit').on 'click', (e) ->
    e.preventDefault()
    $form = $('form')
    survey_id = $('#survey_id').val()
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
        $responseCount = response.length

        # if we have more than one response object
        if $responseCount > 1
          # create a collapsible panel
          panel = HandlebarsTemplates['hanuman/templates/survey/panel'](response[0])
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
                newRow = HandlebarsTemplates['hanuman/templates/survey/observation'](observation)
                $('.panel-body').last().append(newRow)
              else
                # if not render observation template after the last static row
                newRow = HandlebarsTemplates['hanuman/templates/survey/observation'](observation)
                $(newRow).insertAfter($('.form-control-static').last().closest('.form-group'))
        else
          # add observation to end of the last collapsible panel or form group with a form control static
          for observation in response
            do (observation) ->
              newRow = HandlebarsTemplates['hanuman/templates/survey/observation'](observation)
              $(newRow).insertAfter($('.panel, .form-control-static').not('.panel .form-control-static').last().closest('.panel, .form-group'))

        # clear out observation field(s)
        $('input[type!=hidden][type!=radio][type!=submit]').val("")
        $('input[type=radio]').attr('checked', false)
        $('select[multiple!=multiple]').each ->
          this.selectedIndex = 0
        $('.search-choice-close').click()

        # increment group value(s)
        $group = $('input[type=hidden][name*=\\[set\\]]')
        groupVal = parseInt $($group[0]).val()
        $group.val(groupVal + 1)

    ).fail (jqXHR, textStatus, errorThrown) ->
      errorRow = HandlebarsTemplates['hanuman/templates/survey/error'](errorThrown)
      $(errorRow).insertAfter($('.form-control-static').last().closest('.form-group'))
      # todo add honeybadger notification

  # hide all collapsible panels at start of step_2 and step_3
  if $('form[action*=\\/hanuman\\/survey_steps\\/step_2], form[action*=\\/hanuman\\/survey_steps\\/step_3]').length > 0
    if $(".panel-collapse").length > 0
      # hide all existing panels
      $('.panel-collapse').collapse()
