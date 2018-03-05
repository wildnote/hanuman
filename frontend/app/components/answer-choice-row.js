import { isNone } from '@ember/utils';
import DraggableObject from 'ember-drag-drop/components/draggable-object';

export default DraggableObject.extend({
  tagName: 'tr',

  classNameBindings: [':js-draggableObject', 'isDraggingObject:is-dragging-object:', 'overrideClass', 'isNewAnswerChoice:no-hover'],
  attributeBindings: ['dragReady:draggable', 'answerChoice.id:data-answer-choice-id'],

  isEditingAnswerChoice: false,

  setNewAnswerChoice() {
    let lastAnswer = this.get('question.answerChoices.lastObject');
    let sortOrder = lastAnswer && lastAnswer.get('sortOrder') ? lastAnswer.get('sortOrder') + 1 : null;
    let answerChoice = this.get('question').store.createRecord('answerChoice', {
      optionText: '',
      sortOrder,
      hideFromList: true
    });
    this.set('answerChoice', answerChoice);
  },

  actions: {
    toggleForm(_e, forceToSetNew = false) {
      this.toggleProperty('isEditingAnswerChoice');
      if (forceToSetNew || isNone(this.get('answerChoice'))) {
        this.setNewAnswerChoice();
      }
    },

    save() {
      let answerChoice = this.get('answerChoice');
      if (answerChoice.validate()) {
        answerChoice.set('question', this.get('question'));
        this.sendAction('save', answerChoice, () => {
          this.send('toggleForm');
          if (this.get('isNewAnswerChoice')) {
            this.set('answerChoice', null);
          }
        });
      }
    },

    delete() {
      let answerChoice = this.get('answerChoice');
      answerChoice.deleteRecord();
      if (!answerChoice.get('isNew')) {
        answerChoice.save();
      }
    }
  }
});
