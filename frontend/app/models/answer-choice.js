import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  // Attributes
  optionText: attr('string'),
  scientificText: attr('string'),
  groupText: attr('string'),
  sortOrder: attr('number'),

  // Associations
  question: belongsTo('question'),

  // Validations
  validations: {
    optionText: {
      presence: true
    }
  }
});
