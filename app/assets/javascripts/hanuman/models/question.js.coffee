App.Question = DS.Model.extend({
  questionText: DS.attr('string'),
  answerType: DS.belongsTo('answerType', {async: true}),
  answerChoices: DS.hasMany('answerChoice', {async: true}),
  sortOrder: DS.attr('number'),
  surveyStep: DS.belongsTo('surveyStep')
  required: DS.attr('boolean')
})
