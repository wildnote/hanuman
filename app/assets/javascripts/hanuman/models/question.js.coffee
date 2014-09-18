App.Question = DS.Model.extend({
  survey_questions: DS.hasMany('survey_question'),
  question_text: DS.attr('string'),
  answer_type: DS.belongsTo('answer_type', {async: true}),
  answer_choices: DS.hasMany('answer_choice', {async: true})
})
