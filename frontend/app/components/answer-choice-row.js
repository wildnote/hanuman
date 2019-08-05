import Component from '@ember/component';
import { run } from '@ember/runloop';
import { isNone } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: 'tr',

  classNameBindings: ['isNewAnswerChoice:no-hover'],
  attributeBindings: ['answerChoice.id:data-answer-choice-id'],

  isEditingAnswerChoice: false,

  setNewAnswerChoice() {
    let lastAnswer = this.get('question.answerChoices.lastObject');
    let sortOrder = lastAnswer && lastAnswer.get('sortOrder') ? lastAnswer.get('sortOrder') + 1 : null;
    let answerChoice = this.get('question').store.createRecord('answerChoice', {
      optionText: '',
      sortOrder
    });
    this.set('answerChoice', answerChoice);
  },

  saveTask: task(function*() {
    let answerChoice = this.get('answerChoice');
    // Strip any trailing spaces off of an answer before saving it.
    let optionText = answerChoice.get('optionText');
    answerChoice.set('optionText', optionText.trim());

    if (answerChoice.validate()) {
      answerChoice.set('question', this.get('question'));
      yield this.get('saveParentTask').perform(answerChoice);
      answerChoice.set('hideFromList', false);
      this.send('toggleForm');
      if (this.get('isNewAnswerChoice')) {
        this.set('answerChoice', null);
        this.send('toggleForm');
      }
    }
  }),

  actions: {
    toggleForm(_e, forceToSetNew = false) {
      this.toggleProperty('isEditingAnswerChoice');
      if (forceToSetNew || isNone(this.get('answerChoice'))) {
        this.setNewAnswerChoice();
      }
      run.next(this, function() {
        this.$('input').focus();
      });
    },

    delete() {
      let answerChoice = this.get('answerChoice');
      answerChoice.deleteRecord();
      if (!answerChoice.get('isNew')) {
        answerChoice.save();
      }
    },

    inputKeyUp(value) {
      value = value.slice(0, 255);
      this.answerChoice.set('optionText', value);
      this.$().val(value);
      if (event.keyCode == 13) {
        this.get('saveTask').perform();
      }
    }
  }
});
