import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  optionText: attr('string'),
  scientificText: attr('string'),
  groupText: attr('string'),

  // Associations
  question: belongsTo('question')
});
