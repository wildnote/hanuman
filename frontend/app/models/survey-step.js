import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  duplicator: attr('boolean'),
  step: attr('number')
});
