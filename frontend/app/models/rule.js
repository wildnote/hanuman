import Model from 'ember-data/model';
import { A } from '@ember/array';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  init() {
    this.set('conditionsPendingSave', A());
  },

  // Attributes
  matchType: attr('string', { defaultValue: 'any' }),
  type: attr('string', { defaultValue: 'Hanuman::VisibilityRule' }),
  value: attr('string'),

  // Relations
  conditions: hasMany('condition', { async: false }),
  question: belongsTo('question'),

  // Validations
  validations: {
    matchType: {
      inclusion: { in: ['any', 'all'] }
    }
  }
});
