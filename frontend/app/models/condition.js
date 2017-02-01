import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

// Constants
const OPERATORS = [
  'is equal to',
  'is not equal to',
  'is empty',
  'is not empty',
  'is greater than',
  'is less than',
  'starts with',
  'contains'
];

const Condition = Model.extend(Validator, {
  // Attributes
  operator: attr('string', { defaultValue: 'is equal to' }),
  answer: attr('string', { defaultValue: '' }),
  questionId: attr('string'),

  // Associations
  rule: belongsTo('rule'),

  // Validations
  validations: {
    questionId:{
      presence: true
    },
    operator:{
      inclusion: {
        in: OPERATORS
      }
    }
  }
});

Condition.reopenClass({
  OPERATORS: OPERATORS
});

export default Condition;