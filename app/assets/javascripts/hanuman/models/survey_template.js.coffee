App.SurveyTemplate = DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  survey_type: DS.attr('string'),
  survey_questions: DS.hasMany('survey_question', {async: true})
})
