import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import { computed } from '@ember/object';
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

// Operators that don't require an answer
const OPERATORS_WITHOUT_ANSWER = ['is empty', 'is not empty'];

const Condition = Model.extend(Validator, {
  // Attributes
  operator: attr('string', { defaultValue: 'is equal to' }),
  answer: attr('string', { defaultValue: '' }),
  questionId: attr('string'),

  // Associations
  rule: belongsTo('rule', { inverse: 'conditions' }),

  question: computed('questionId', function() {
    return this.store.peekRecord('question', this.questionId);
  }),

  // Validations
  validations: {
    questionId: {
      presence: true
    },
    operator: {
      inclusion: {
        in: OPERATORS
      }
    },
    answer: {
      custom: {
        validation(_key, value, model) {
          // For calculation rules, we don't need answers at all
          if (model.get('rule.type') === 'Hanuman::CalculationRule') {
            return true;
          }
          
          if (OPERATORS_WITHOUT_ANSWER.includes(model.get('operator'))) {
            return true;
          }
          // This will catch null, undefined, and empty string (even with spaces)
          return value && value.trim().length > 0;
        },
        message: 'Answer is required for this operator.'
      }
    }
  }
});

Condition.reopenClass({
  OPERATORS,
  OPERATORS_WITHOUT_ANSWER
});

export default Condition;
