import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { filterBy } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  classNames: 'panel rule-panel',

  init() {
    this._super(...arguments);
    // Check if rule has conditions
    const rule = this.get('rule');
    if (!rule) {
      console.warn('Rule is null or undefined in rule-panel component');
      return;
    }

    console.log('Rule panel initialized with rule:', rule.get('id'));

    // Check if rule has conditions
    const conditions = rule.get('conditions');
    if (!conditions) {
      console.warn('Rule is missing conditions relationship:', rule.get('id'));
    } else {
      console.log('Rule has conditions relationship. Conditions:', conditions.toArray());

      // Try to force load conditions if the array is empty
      if (conditions.get('length') === 0) {
        console.log('Attempting to force load conditions for rule:', rule.get('id'));

        // Try to reload the rule to get its conditions
        this.store.findRecord('rule', rule.get('id'), { include: 'conditions', reload: true }).then(updatedRule => {
          console.log('Rule reloaded with conditions:', updatedRule.get('conditions').toArray());
        }).catch(error => {
          console.error('Error reloading rule:', error);
        });
      }
    }
  },

  conditions: filterBy('rule.conditions', 'isNew', false),

  choicesValueSelected: computed('rule.value', 'question.answerChoices.[]', function() {
    let choiceIds = (this.get('rule.value') || '').split(',');
    let answerChoices = this.get('question.answerChoices');
    return answerChoices.filter((answerChoice) => choiceIds.includes(answerChoice.id));
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
    },
    editorReady(editor) {
      editor.getSession().setUseWorker(false);
    }
  }
});
