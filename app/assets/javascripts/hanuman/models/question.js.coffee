App.Question = DS.Model.extend({
  question_text: DS.attr('string'),
  answer_type: DS.belongsTo('answer_type', {async: true}),
  answer_choices: DS.hasMany('answer_choice', {async: true}),
  sort_order: DS.attr('number'),
  survey_step: DS.belongsTo('survey_step', {async: true})
})
