App.AnswerChoice = DS.Model.extend({
  option_text: DS.attr('string'),
  scientific_text: DS.attr('string'),
  question: DS.belongsTo('question')
})
