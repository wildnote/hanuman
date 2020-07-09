import Ember from 'ember';
import DraggableObject from 'ember-drag-drop/components/draggable-object';
import { run } from '@ember/runloop';
import { isNone } from '@ember/utils';
import { task } from 'ember-concurrency';
import { alias } from '@ember/object/computed';

export default DraggableObject.extend({
  tagName: 'tr',

  classNameBindings: [':js-draggableObject','isDraggingObject:is-dragging-object:', 'overrideClass','isNewAnswerChoice:no-hover'],
  attributeBindings: ['dragReady:draggable','answerChoice.id:data-answer-choice-id'],

  isEditingAnswerChoice: false,
  isSortable: true,

  isFullyEditable: alias('question.surveyTemplate.fullyEditable'),

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

    confirm() {
      let el = this.get('element');
      let $confirm = $('.delete-confirm', el);
      $confirm.fadeIn();
    },

    cancel() {
      let el = this.get('element');
      let $confirm = $('.delete-confirm', el);
      $confirm.fadeOut();
    },

    delete() {
      let answerChoice = this.get('answerChoice');
      answerChoice.deleteRecord();
      if (!answerChoice.get('isNew')) {
        answerChoice.save();
      }
    },

    inputKeyUp(event) {
      if (event.keyCode == 13) {
        this.get('saveTask').perform();
      }
    },
  }
});
