import Ember from 'ember';

export default Ember.Component.extend({
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
      this.sendAction('save',answerChoice);
      if(answerChoice.get('isNew')){
        this.set('answerChoice',null);
      }
      this.send('toggleForm');
    },

    delete() {
      let answerChoice = this.get('answerChoice');
      answerChoice.deleteRecord();
      answerChoice.save();
    }
  }
});
