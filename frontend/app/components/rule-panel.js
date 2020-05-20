import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { filterBy } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  classNames: 'panel rule-panel',
  conditions: filterBy('rule.conditions', 'isNew', false),

  choicesValueSelected: computed('rule.value', 'question.answerChoices.[]', function() {
    let choiceIds = (this.get('rule.value') || '').split(',');
    let answerChoices = this.get('question.answerChoices');
    return answerChoices.filter((answerChoice) => choiceIds.includes(answerChoice.id));
  }),

  isLookupRule: computed('rule.type', function () {
    return this.rule.get('type') === 'Hanuman::LookupRule';
  }),

  isCalculationRule: computed('rule.type', function () {
    return this.rule.get('type') === 'Hanuman::CalculationRule';
  }),

  saveConditionTask: task(function*(condition, rule) {
    if (this.get('question.isNew') || rule.get('isNew')) {
      if (rule.get('conditionsPendingSave').indexOf(condition) === -1) {
        rule.get('conditionsPendingSave').pushObject(condition);
      }
    } else {
      yield condition.save();
    }
  }),

  removeConditionTask: task(function*(condition, rule) {
    if (rule.isNew || condition.get('isNew')) {
      rule.get('conditionsPendingSave').removeObject(condition);
      condition.deleteRecord();
    } else {
      try {
        condition.deleteRecord();
        yield condition.save();
        yield rule.reload();
      } catch (e) {
        this.store.unloadRecord(rule);
        console.log({ e }); // eslint-disable-line no-console
        // If this was the last condition the API deletes the rule
        if (e.errors && e.errors[0] === 'Record not found.') {
          // This was a visibilitry rule
        }
      }
    }
  }),
  actions: {
    setRuleMatchType(matchType) {
      this.rule.set('matchType', matchType);
    },
    setAnswerChoiceRuleValue(answerChoices) {
      let value = answerChoices.map((answerChoice) => answerChoice.id).join(',');
      this.rule.set('value', value);
    },
    deleteRule() {
      this.rule.destroyRecord();
    }
  }
});
