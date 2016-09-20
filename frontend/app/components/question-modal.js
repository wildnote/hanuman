import Ember from 'ember';
const {
  computed,
  computed: { alias, sort }
} = Ember;

export default Ember.Component.extend({
  remodal: Ember.inject.service(),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  answerChoicesPendingSave: [],
  conditionsPendingSave: [],
  sortTypesBy: ['name'],
  sortChoicesBy: ['optionText'],
  sortedAnswerTypes: sort('answerTypes', 'sortTypesBy'),
  sortedAnswerChoices: sort('question.answerChoices', 'sortChoicesBy'),
  ancestryQuestions: computed('questions', function() {
    return this.get('questions').filter(function(question) {
      let allowedTypes = ['section','repeater'];
      return allowedTypes.includes(question.get('answerType.name'));
    });
  }),
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
      Ember.$(this).tab('show');
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

  _sortOrder(question){
    let surveyTemplate = this.get('surveyTemplate'),
        lastQuestion = surveyTemplate.get('questions').sortBy('sortOrder').get('lastObject');
    question.set('sortOrder',lastQuestion.get('sortOrder') + 1);
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
          surveyTemplate = this.get('surveyTemplate');
      question.set('surveyTemplate', surveyTemplate);
      if(question.validate()){
        if(question.get('isNew')){
          this._sortOrder(question);
        }
        question.save().then(
          (question)=>{
            let promises = [],
                answerChoicesPendingSave = this.get('answerChoicesPendingSave'),
                answerChoicesPromises = this._pendingObjectsPromises(answerChoicesPendingSave, 'question', question);

            promises = promises.concat(answerChoicesPromises);

            // We can't save the rule until there is at least one condition associated with the rule
            if(question.get('rule') && (!question.get('rule.isNew') || this.get('conditionsPendingSave.length') > 0)){
              let conditionsPendingSave = this.get('conditionsPendingSave'),
                  rule = question.get('rule');
              rule.set('question',question);
              rule.save().then((rule) =>{
                let conditionsPromises = this._pendingObjectsPromises(conditionsPendingSave, 'rule', rule);
                promises = promises.concat(conditionsPromises);
                this._saveSuccess(question, promises);
              });
            }else{
              this._saveSuccess(question, promises);
            }
          },
          (error)=>{
            console.error(`An error has occured: ${error}.`);
            surveyTemplate.get('questions').removeObject(question);
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
