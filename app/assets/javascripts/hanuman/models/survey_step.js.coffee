App.SurveyStep = DS.Model.extend({
  surveyTemplate: DS.belongsTo('surveyTemplate', {async: true}),
  questions: DS.hasMany('question', {async: true}),
  duplicator: DS.attr('boolean'),
  step: DS.attr('number')
})
