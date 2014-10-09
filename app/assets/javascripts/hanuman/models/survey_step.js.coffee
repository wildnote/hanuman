App.SurveyStep = DS.Model.extend({
  survey_template: DS.belongsTo('survey_template'),
  questions: DS.hasMany('question', {async: true}),
  duplicator: DS.attr('boolean'),
  step: DS.attr('number')
})
