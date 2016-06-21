import Ember from 'ember';
const {
  computed,
  computed: { alias, sort }
} = Ember;

export default Ember.Component.extend({
  remodal: Ember.inject.service(),
  isFullyEditable: alias('surveyStep.surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  answerChoicesPendingSave: [],
  sortBy: ['name'],
  sortedAnswerTypes: sort('answerTypes','sortBy'),
  ancestryQuestion: computed('question.ancestry', function() {
    return this.get('questions').findBy('id',this.get('question.ancestry'));
  }),

  didInsertElement() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      this.get('remodal').open('question-modal');
    });
  },

  _removeAnswerChoices() {
    this.get('question.answerChoices').then((answerChoices)=>{
      answerChoices.forEach(function(answerChoice) {
        answerChoice.deleteRecord();
        answerChoice.save();
      });
    });
  },

  actions: {
    ancestryChange(newAncestryId){
      let question = this.get('question');
      if(Ember.isBlank(newAncestryId)){
        newAncestryId = null;
      }
      question.set('ancestry',newAncestryId);
    },

    setAnswerType(answerTypeId) {
      const answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
    },

    save() {
      let question = this.get('question'),
          surveyStep = this.get('surveyStep');
      question.set('surveyStep', surveyStep);
      if(question.validate()){
        question.save().then(
          (question)=>{
            let answerChoicesPendingSave = this.get('answerChoicesPendingSave');
            // loop through answerChoicesPendingSave and set question_id or question
            for (var answerChoicesPending of answerChoicesPendingSave) {
              answerChoicesPending.set('question', question);
            }
            if(!question.get('answerType.hasAnswerChoices')){
              this._removeAnswerChoices();
            }
            let promises = answerChoicesPendingSave.invoke('save');
            Ember.RSVP.all(promises).then(()=>{
              while (answerChoicesPendingSave.length > 0) {
                answerChoicesPendingSave.pop();
              }
              this.send('closeModal');
            });
          },
          (error)=>{
            console.error(`An error has occured: ${error}.`);
            surveyStep.get('questions').removeObject(question);
          }
        );
      }
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
