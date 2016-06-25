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
  conditionsPendingSave: [],
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
    // Tabs
    Ember.$('a[data-toggle="tab"]').on('click', function(e) {
      e.preventDefault();
      Ember.$$(this).tab('show');
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

  _pendingObjectsPromises(pendingObjects, toSet, objTo){
    for (var pendingObject of pendingObjects) {
      pendingObject.set(toSet, objTo);
    }
    return pendingObjects.invoke('save');
  },

  _saveSuccess(question, promises){
    let answerChoicesPendingSave = this.get('answerChoicesPendingSave'),
        conditionsPendingSave = this.get('conditionsPendingSave');

    if(!question.get('answerType.hasAnswerChoices')){
      this._removeAnswerChoices();
    }
    promises = Ember.$.makeArray(promises);
    Ember.RSVP.all(promises).then(()=>{
      while (answerChoicesPendingSave.length > 0) {
        answerChoicesPendingSave.pop();
      }
      while (conditionsPendingSave.length > 0) {
        conditionsPendingSave.pop();
      }
      this.send('closeModal');
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

    setRuleMatchType(matchType) {
      this.set('question.rule.matchType', matchType);
    },

    save() {
      let question = this.get('question'),
          surveyStep = this.get('surveyStep');
      question.set('surveyStep', surveyStep);
      if(question.validate()){
        question.save().then(
          (question)=>{
            let promises = [],
                answerChoicesPendingSave = this.get('answerChoicesPendingSave'),
                answerChoicesPromises = this._pendingObjectsPromises(answerChoicesPendingSave, 'question', question);

            promises = promises.concat(answerChoicesPromises);

            if(question.get('rule')){
              let conditionsPendingSave = this.get('conditionsPendingSave'),
                  rule = question.get('rule');
              rule.set('question',question);
              rule.save().then((rule) =>{
                let conditionsPromises = this._pendingObjectsPromises(conditionsPendingSave, 'rule', rule);
                promises = promises.concat(conditionsPromises);
                this._saveSuccess(promises);
              });
            }else{
              this._saveSuccess(promises);
            }
          },
          (error)=>{
            console.error(`An error has occured: ${error}.`);
            surveyStep.get('questions').removeObject(question);
          }
        );
      }
    },

    saveCondition(condition){
      if(this.get('question.isNew') || this.get('question.rule.isNew')){
        this.get('conditionsPendingSave').push(condition);
      }else{
        condition.save();
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
