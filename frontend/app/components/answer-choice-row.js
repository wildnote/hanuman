import Ember from 'ember';
import DraggableObject from 'ember-drag-drop/components/draggable-object';

export default DraggableObject.extend({
  tagName: 'tr',

  classNameBindings: [':js-draggableObject','isDraggingObject:is-dragging-object:', 'overrideClass','isNewAnswerChoice:no-hover'],
  attributeBindings: ['dragReady:draggable','answerChoice.id:data-answer-choice-id'],

  isEditingAnswerChoice: false,

  setNewAnswerChoice() {
    let lastAnswer = this.get('question.answerChoices.lastObject'),
        sortOrder = lastAnswer ? lastAnswer.get('sortOrder') : 0;
    let answerChoice = this.get('question').store.createRecord('answerChoice',{
      optionText: '',
      sortOrder: sortOrder + 1
    });
    this.set('answerChoice', answerChoice);
  },

  actions: {
    toggleForm() {
      this.toggleProperty('isEditingAnswerChoice');
      if(Ember.isNone(this.get('answerChoice'))){
        this.setNewAnswerChoice();
      }
    },

    save() {
      let answerChoice = this.get('answerChoice');
      if(answerChoice.validate()){
        answerChoice.set('question', this.get('question'));
        this.sendAction('save',answerChoice);
        if(this.get('isNewAnswerChoice')){
          this.set('answerChoice',null);
        }
        this.send('toggleForm');
      }
    },

    delete() {
      let answerChoice = this.get('answerChoice');
      answerChoice.deleteRecord();
      if(!answerChoice.get('isNew')){
        answerChoice.save();
      }
    }
  }
});
