import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  duplicator: attr('boolean'),
  step: attr('number'),

  // Relations
  surveyTemplate: belongsTo('survey-template'),
  questions: hasMany('question')
});
