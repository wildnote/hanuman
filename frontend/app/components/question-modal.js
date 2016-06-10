import Ember from 'ember';
const {
  computed: { alias }
} = Ember;

export default Ember.Component.extend({
  remodal: Ember.inject.service(),
  isFullyEditable: alias('surveyStep.surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  answerChoicesPendingSave: [],

  didInsertElement() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      this.get('remodal').open('question-modal');
    });
  },

  actions: {
    setAnswerType(answerTypeId) {
      const answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
    },

    save() {
      let question = this.get('question'),
          surveyStep = this.get('surveyStep');
      question.set('surveyStep', surveyStep);
      question.save().then(
        (question)=>{
          // loop through answerChoicesPendingSave and set question_id or question
          for (var answerChoicesPending of this.get('answerChoicesPendingSave')) {
            answerChoicesPending.set('question', question);
          }
          let promises = this.get('answerChoicesPendingSave').invoke('save');
          Ember.RSVP.all(promises).then(()=>{
            this.set('answerChoicesPendingSave', []);
            this.send('closeModal');
          });
        },
        (error)=>{
          console.error(`An error has occured: ${error}.`);
          surveyStep.get('questions').removeObject(question);
        }
      );
    },

    saveAnswerChoice(answerChoice){
      if(this.get('question.isNew')){
        this.get('answerChoicesPendingSave').push(answerChoice);
      }else{
        answerChoice.save();
      }
    },

    closeModal() {
      this.get('remodal').close('question-modal');
      this.sendAction('transitionToSurveyStep');
    }
  }
});
