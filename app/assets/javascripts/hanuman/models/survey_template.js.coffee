App.SurveyTemplates = DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  survey_type: DS.attr('string')
})

App.SurveyTemplates.FIXTURES = [
  {
    id: 1
    name: 'General Outbreak Animal'
    status: 'active'
    survey_type: 'Animal'
  },
  {
    id: 2
    name: 'General Outbreak Environmental Health'
    status: 'active'
    survey_type: 'Environmental Health'
  },
  {
    id: 3
    name: 'General Outbreak Hospital/Clinic'
    status: 'active'
    survey_type: 'Hospital/Clinic'
  },
  {
    id: 4
    name: 'General Outbreak Long Term Care'
    status: 'active'
    survey_type: 'Long Term Care'
  },
  {
    id: 5
    name: 'General Outbreak School'
    status: 'active'
    survey_type: 'School'
  }
];
