App.QuestionController = Ember.ObjectController.extend({
  needs: "answer_choices"
  answer_choices: (->
    Ember.ArrayProxy.createWithMixins Ember.SortableMixin,
      sortProperties: ["option_text"],
      content: @get("content.answer_choices")
  ).property("content.answer_choices")
})