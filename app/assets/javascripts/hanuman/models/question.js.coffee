App.Question = DS.Model.extend({
  survey_questions: DS.hasMany('survey_questions'),
  question_text: DS.attr('integer'),
  answer_type: DS.attr('answer_type')
})
