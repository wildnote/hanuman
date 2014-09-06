App.SurveyQuestion = DS.Model.extend({
  survey_template: DS.belongsTo('survey_template'),
  question: DS.belongsTo('question'),
  sort_order: DS.attr('integer'),
  duplicator: DS.attr('boolean'),
  step: DS.attr('integer')
})
