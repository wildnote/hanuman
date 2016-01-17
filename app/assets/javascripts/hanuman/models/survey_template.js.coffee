App.SurveyTemplate = DS.Model.extend({
  name: DS.attr('string')
  status: DS.attr('string')
  surveyType: DS.attr('string')
  surveySteps: DS.hasMany('surveyStep', {async: true})
  fullyEditable: DS.attr('boolean')
  duplicatorLabel: DS.attr('string')
})
