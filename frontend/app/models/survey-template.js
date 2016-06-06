import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  name: attr('string'),
  status: attr('string'),
  surveyType: attr('string'),
  fullyEditable: attr('boolean'),
  duplicatorLabel: attr('string'),

  // Associations
  surveySteps: hasMany('survey-step')
});
