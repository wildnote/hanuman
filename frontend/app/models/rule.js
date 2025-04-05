import Model from 'ember-data/model';
import { A } from '@ember/array';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
import { filterBy } from '@ember/object/computed';
import { computed } from '@ember/object';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  init() {
    this._super(...arguments);
    this.set('conditionsPendingSave', A());

    // Ensure conditions is initialized
    if (!this.get('conditions')) {
      console.warn('Conditions not initialized for rule:', this.id);
      this.set('conditions', A());
    }
  },

  didLoad() {
    this._super(...arguments);
    console.log('Rule loaded:', this.id);

    // Check if conditions are loaded
    const conditions = this.get('conditions');
    if (conditions) {
      console.log('Rule has conditions:', conditions.toArray());
    } else {
      console.warn('Rule loaded without conditions:', this.id);
    }
  },

  textValue: computed('value', 'question.answerType.hasAnswerChoices', function() {
    if (this.get('question.answerType.hasAnswerChoices')) {
      let choiceIds = (this.value || '').split(',');
      let answerChoices = this.get('question.answerChoices');
      return answerChoices
        .filter((answerChoice) => choiceIds.includes(answerChoice.id))
        .map((ac) => ac.optionText)
        .join(',');
    }
    return this.value;
  }),

  isLookupRule: computed('type', function() {
    return this.get('type') === 'Hanuman::LookupRule';
  }),

  isCalculationRule: computed('type', function() {
    return this.get('type') === 'Hanuman::CalculationRule';
  }),

  // Attributes
  matchType: attr('string', { defaultValue: 'any' }),
  type: attr('string', { defaultValue: 'Hanuman::VisibilityRule' }),
  value: attr('string'),
  script: attr('string', { defaultValue: '' }), // Script has to be blank, rather than null, otherwise Ace Editor will fail on init

  // Relations
  conditions: hasMany('condition', { async: false, inverse: 'rule' }),
  question: belongsTo('question'),

  savedConditions: filterBy('conditions', 'isNew', false),

  // Validations
  validations: {
    matchType: {
      inclusion: { in: ['any', 'all'] }
    }
  }
});
