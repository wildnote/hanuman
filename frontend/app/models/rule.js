import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  // Attributes
  matchType: attr('string', { defaultValue: 'any' }),

  // Relations
  conditions: hasMany('condition'),
  question: belongsTo('question'),

  validations: {
    matchType:{
      inclusion: { in: ['any', 'all'] }
    }
  }
});
