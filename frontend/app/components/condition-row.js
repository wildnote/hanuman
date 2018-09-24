import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isNone } from '@ember/utils';
import Condition from '../models/condition';

export default Component.extend({
  for: alias('condition'),
  tagName: 'tr',
  attributeBindings: ['condition.id:data-condition-id'],
  classNameBindings: ['isNewCondition:no-hover'],
  isEditingCondition: false,

  operators: computed('currentQuestion', function() {
    let answerType = this.get('currentQuestion.answerType');
    if (['checkboxes', 'multiselect'].includes(answerType.get('elementType'))) {
      return Condition.OPERATORS.filter(function(op) {
        return op.includes('equal');
      });
    } else {
      return Condition.OPERATORS;
    }
  }),

  currentQuestion: computed('condition.questionId', function() {
    return this.get('questions').findBy('id', this.get('condition.questionId'));
  }),

  questionAnswerChoices: computed('currentQuestion', function() {
    return this.get('currentQuestion.answerChoices');
  }),

  useDropDownAnswerSelect: computed('currentQuestion', 'condition.operator', function() {
    let currentQuestion = this.get('currentQuestion');
    let conditionOperator = this.get('condition.operator');
    return (
      conditionOperator !== 'contains' && currentQuestion && currentQuestion.hasMany('answerChoices').ids().length > 1
    );
  }),

  setNewCondition() {
    let condition = this.get('question.rule').store.createRecord('condition', {
      questionId: this.get('questions.firstObject.id')
    });
    this.set('condition', condition);
  },

  actions: {
    toggleForm() {
      this.toggleProperty('isEditingCondition');
      if (isNone(this.get('condition'))) {
        this.setNewCondition();
      }
    },

    save() {
      let condition = this.get('condition');

      // Strip any trailing spaces off of a condition answer before saving it.
      let answer = condition.get('answer') || '';
      condition.set('answer', answer.trim());

      if (condition.validate()) {
        condition.set('rule', this.get('question.rule'));
        this.saveTask.perform(condition);
        if (this.get('isNewCondition')) {
          this.set('condition', null);
        }
        this.send('toggleForm');
      }
    },

    delete() {
      let condition = this.get('condition');
      this.removeTask.perform(condition);
    },
    setConditionOperator(operator) {
      this.set('condition.operator', operator);
    },
    setConditionQuestion(questionId) {
      this.set('condition.questionId', questionId);
    },
    setConditionAnswer(answer) {
      this.set('condition.answer', answer);
    }
  }
});
