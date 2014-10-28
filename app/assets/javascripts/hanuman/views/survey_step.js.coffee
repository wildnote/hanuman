App.SurveyStepView = Ember.View.extend(
  didInsertElement: ->
    controller = @get("controller")
    @$(".sortable").sortable 
      update: (event, ui) ->
        indexes = {}
        $(this).find(".item").each (index) ->
          indexes[$(this).data("id")] = index
        # $(this).sortable "cancel"
        controller.updateSortOrder indexes
)