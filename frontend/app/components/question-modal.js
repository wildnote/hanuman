import Ember from 'ember';
const {
  $,
  run,
  computed,
  observer,
  on,
  computed: { alias, sort }
} = Ember;

export default Ember.Component.extend({
  remodal: Ember.inject.service(),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  hasAnAnswer: alias('question.answerType.hasAnAnswer'),
  sortTypesBy: ['displayName'],
  sortedAnswerTypes: sort('filteredAnswerTypes', 'sortTypesBy'),
  filteredAnswerTypes: computed('answerTypes', function() {
    let answerTypes = this.get('answerTypes');
    if(this.get('isSuperUser')){
      return answerTypes;
    }else{
      return answerTypes.filter((answerType) => {
        return !answerType.get('name').includes('taxon');
      });
    }
  }),
  ancestryQuestions: computed('questions', function() {
    return this.get('questions').filter((question) => {
      let allowedTypes = ['section','repeater'];
      return allowedTypes.includes(question.get('answerType.name'));
    });
  }),
  conditionalQuestions: computed('questions','question', function() {
    let question = this.get('question');
    return this.get('questions').filter((condQuestion) => {
      return condQuestion !== question && condQuestion.get('answerType.hasAnAnswer');
    });
  }),
  ancestryQuestion: computed('question.parentId', function() {
    return this.get('questions').findBy('id',this.get('question.parentId'));
  }),

  isRequiredDisabled: computed('question.{rule.isNew,answerType.name}','conditionsPendingSave.[]', function() {
    let question = this.get('question'),
        newRule = question.get('rule.isNew'),
        notTypes = ['section','repeater','helperabove','helperbelow'],
        pendingConditions = this.get('conditionsPendingSave.length') > 0;
    if(newRule === undefined){
      newRule = true;
    }
    let isDisabled = !newRule || pendingConditions || notTypes.includes(question.get('answerType.name'));
    if(isDisabled){
      run.later(this, ()=> { this.set('question.required', false); }, 0);
    }
    return isDisabled;
  }),

  showQuestionTypePlaceholder: computed('question.{isNew,answerType.id}', function() {
    let question = this.get('question');
    return question.get('isNew') && question.get('answerType.id') === undefined;
  }),

  // If a question has a rule associated with it, it should automatically be set to Hidden
  hideQuestion: on('afterRender', observer('question.{rule.isNew,rule.conditions.[]}','conditionsPendingSave.[]', function() {
    let question = this.get('question'),
        newRule = question.get('rule.isNew'),
        hasConditions = (this.get('conditionsPendingSave.length') > 0) || (question.get('rule') && question.get('rule').hasMany('conditions').ids().length > 0);
    if(newRule === undefined){
      newRule = true;
    }
    let toHide = !newRule || hasConditions;
    this.set('question.hidden', toHide);
  })),

  init() {
    this._super(...arguments);
    this.setProperties({
      answerChoicesPendingSave: [],
      conditionsPendingSave: []
    });
  },

  didInsertElement() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      this.get('remodal').open('question-modal');
      $('[data-toggle="popover"]').popover({});

    });
    // Tabs
    $('a[data-toggle="tab"]').on('click', function(e) {
      e.preventDefault();
      $(this).tab('show');
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

  _saveSuccess(question, promises, keepOpen){
    question.reload().then((question)=>{
      let answerChoicesPendingSave = this.get('answerChoicesPendingSave'),
          conditionsPendingSave = this.get('conditionsPendingSave');

      if(!question.get('answerType.hasAnswerChoices')){
        this._removeAnswerChoices();
      }
      promises = $.makeArray(promises);
      Ember.RSVP.all(promises).then(()=>{
        while (answerChoicesPendingSave.length > 0) {
          answerChoicesPendingSave.popObject();
        }
        while (conditionsPendingSave.length > 0) {
          conditionsPendingSave.popObject();
        }
        if(keepOpen){
          if(!question.get('rule')){
            let store = question.get('store');
            question.set('rule', store.createRecord('rule'));
          }
        }else{
          this.send('closeModal');
        }
      });
    });
  },

  _sortOrder(question){
    let surveyTemplate = this.get('surveyTemplate'),
        lastQuestion = surveyTemplate.get('questions').sortBy('sortOrder').get('lastObject');
    question.set('sortOrder',1);
    if(lastQuestion && lastQuestion !== question){
      question.set('sortOrder',lastQuestion.get('sortOrder') + 1);
    }
  },

  actions: {
    sortAnswerChoices(){
      let question = this.get('question'),
          answerChoices = question.get('answerChoices');
      answerChoices.forEach((answerChoice, index) => {
        let oldSortOrder = answerChoice.get('sortOrder'),
            newSortOrder = index + 1;
        if(oldSortOrder !== newSortOrder){
          answerChoice.set('sortOrder', newSortOrder);
          if(!answerChoice.get('isNew')){
            answerChoice.save();
          }
        }
      });
      if(!question.get('isNew')){
        question.reload();
      }
    },

    ancestryChange(newAncestryId){
      let question = this.get('question');
      if(Ember.isBlank(newAncestryId)){
        newAncestryId = null;
      }
      question.set('parentId',newAncestryId);
    },

    setAnswerType(answerTypeId) {
      const answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
      $('input[name=questionText]').focus();
    },

    setRuleMatchType(matchType) {
      this.set('question.rule.matchType', matchType);
    },

    save(_e, keepOpen = false) {
      let question = this.get('question'),
          surveyTemplate = this.get('surveyTemplate');
      question.set('surveyTemplate', surveyTemplate);
      if(question.validate()){
        if(question.get('isNew')){
          question.set('wasNew', true);
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
              rule.save().then(
                (rule) =>{
                  let conditionsPromises = this._pendingObjectsPromises(conditionsPendingSave, 'rule', rule);
                  promises = promises.concat(conditionsPromises);
                  this._saveSuccess(question, promises, keepOpen);
                },
                // Rule was deleted on the server
                () =>{
                  question.get('store').unloadRecord(rule);
                  question.reload().then((question)=>{
                    this._saveSuccess(question, [], keepOpen);
                  });
                }
              );
            }else{
              this._saveSuccess(question, promises, keepOpen);
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
        if(this.get('conditionsPendingSave').indexOf(condition) === -1){
          this.get('conditionsPendingSave').pushObject(condition);
        }
      }else{
        condition.save();
      }
    },

    removeCondition(condition){
      if(this.get('question.rule.isNew') || condition.get('isNew')){
        this.get('conditionsPendingSave').removeObject(condition);
        condition.deleteRecord();
      }else{
        condition.deleteRecord();
        condition.save();
      }
    },

    saveAnswerChoice(answerChoice, cb){
      let question = this.get('question');
      if(question.get('isNew')){
        if(this.get('answerChoicesPendingSave').indexOf(answerChoice) === -1){
          answerChoice.set('hideFromList',false);
          this.get('answerChoicesPendingSave').pushObject(answerChoice);
          cb();
        }
      }else{
        answerChoice.save().then(function(answerChoice) {
          answerChoice.set('hideFromList',false);
          if(question.get('isNew') || !question.get('isValid')){
            cb();
          }else{
            question.reload().then(function() {
              cb();
            });
          }
        });
      }
    },

    closeModal() {
      let question = this.get('question');
      this.get('remodal').close('question-modal');
      this.sendAction('transitionToSurveyStep');
      if(question.get('wasNew')){
        run.later(this, ()=> { $('html, body').animate({ scrollTop: $('.li-question.row.sortable-item:last').offset().top }, 500); }, 500);
        // Question is no longer new after shwoing the visual effect.
        run.later(this, function() {
          question.set('wasNew',false);
        },1500);
      }
    }
  }
});
