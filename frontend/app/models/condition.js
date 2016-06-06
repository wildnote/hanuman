import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  operator: attr('string'),
  answer: attr('string'),

  // Associations
  rule: belongsTo('rule'),
  question: belongsTo('question')
});
