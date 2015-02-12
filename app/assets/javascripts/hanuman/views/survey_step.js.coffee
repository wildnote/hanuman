App.SurveyStepView = Ember.View.extend( 
  questionsObserver: ( ->
    Ember.run.once(this, this.setSortable)
  ).observes('controller.questions.[]').on('didInsertElement')
  
  setSortable: ->
    return  unless @$()
    
    controller = @get("controller")
    @$(".sortable").sortable 
      update: (event, ui) ->
        indexes = {}
        $(this).find(".item").each (index) ->
          indexes[$(this).data("id")] = index
        controller.updateSortOrder indexes
)