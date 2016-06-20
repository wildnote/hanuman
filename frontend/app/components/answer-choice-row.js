import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'tr',
  attributeBindings: ['answerChoice.id:data-answer-choice-id'],
  isEditingAnswerChoice: false,

  setNewAnswerChoice() {
    let answerChoice = this.get('question').store.createRecord('answerChoice',{
      optionText: ''
    });
    this.set('answerChoice', answerChoice);
  },

  actions:{
    toggleForm() {
      this.toggleProperty('isEditingAnswerChoice');
      if(Ember.isNone(this.get('answerChoice'))){
        this.setNewAnswerChoice();
      }
    },

    save() {
      let answerChoice = this.get('answerChoice');
      answerChoice.set('question', this.get('question'));
      if(answerChoice.validate()){
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
