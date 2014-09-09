App.Question = DS.Model.extend({
  survey_questions: DS.hasMany('survey_question'),
  question_text: DS.attr('integer'),
  answer_type: DS.belongsTo('answer_type'),
  answer_choices: DS.hasMany('answer_choices')
})
