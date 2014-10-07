App.SurveyTemplate = DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  survey_type: DS.attr('string'),
  survey_steps: DS.hasMany('survey_step', {async: true})
})
