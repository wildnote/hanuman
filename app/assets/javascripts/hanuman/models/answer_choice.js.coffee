App.AnswerChoice = DS.Model.extend({
  optionText: DS.attr('string')
  scientificText: DS.attr('string')
  question: DS.belongsTo('question')
  groupText: DS.attr('string')
})
