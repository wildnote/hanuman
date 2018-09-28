import Ember from 'ember';
import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { observer, computed, set } from '@ember/object';
import { on } from '@ember/object/evented';
import { equal, sort, alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { bind } from '@ember/runloop';
import $ from 'jquery';
import groupBy from 'ember-group-by';
import window from 'ember-window-mock';
const { testing } = Ember;

export default Component.extend({
  remodal: service(),
  store: service(),

  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  hasAnAnswer: alias('question.answerType.hasAnAnswer'),
  isALatLong: equal('question.answerType.name', 'latlong'),
  sortTypesBy: ['displayName'],
  sortedAnswerTypes: sort('answerTypes', 'sortTypesBy'),
  groupedAnswerTypes: groupBy('sortedAnswerTypes', 'groupType'),

  init() {
    this._super(...arguments);
    this.setProperties({
      answerChoicesPendingSave: [],
      conditionsPendingSave: []
    });
  },

  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, function() {
      this.get('remodal').open('question-modal');
      $('[data-toggle="popover"]').popover({});
    });
    // Tabs
    $('a[data-toggle="tab"]').on('click', function(e) {
      e.preventDefault();
      $(this).tab('show');
    });

    $(document).on('keydown.close-modal', bind(this, this._escapeHandler));
  },

  filteredAnswerTypes: computed('answerTypes', function() {
    let answerTypes = this.get('answerTypes');
    if (this.get('isSuperUser')) {
      return answerTypes;
    } else {
      return answerTypes.filter(answerType => {
        return !answerType.get('name').includes('taxon');
      });
    }
  }),

  ancestryQuestions: computed('questions', function() {
    return this.get('questions').filter(question => {
      let allowedTypes = ['section', 'repeater'];
      return allowedTypes.includes(question.get('answerType.name'));
    });
  }),

  conditionalQuestions: computed('questions', 'question', function() {
    let question = this.get('question');
    return this.get('questions').filter(condQuestion => {
      return condQuestion !== question && condQuestion.get('answerType.hasAnAnswer');
    });
  }),

  ancestryQuestion: computed('question.parentId', function() {
    return this.get('questions').findBy('id', this.get('question.parentId'));
  }),

  isALatLongInsideARepeater: computed('question', function() {
    if (this.get('isALatLong')) {
      let ancestryQuestion = this.get('ancestryQuestion');
      if (ancestryQuestion === undefined) {
        return false;
      } else {
        return ancestryQuestion.get('isARepeater');
      }
    } else {
      return false;
    }
  }),

  isRequiredDisabled: computed('question.{rule.isNew,answerType.name}', 'conditionsPendingSave.[]', function() {
    let question = this.get('question');
    let newRule = question.get('rule.isNew');
    let notTypes = ['section', 'repeater', 'helperabove', 'helperbelow', 'static', 'line'];
    let pendingConditions = this.get('conditionsPendingSave.length') > 0;
    if (newRule === undefined) {
      newRule = true;
    }
    let isDisabled = !newRule || pendingConditions || notTypes.includes(question.get('answerType.name'));
    if (isDisabled) {
      run.later(
        this,
        () => {
          this.set('question.required', false);
        },
        0
      );
    }
    return isDisabled;
  }),

  showQuestionTypePlaceholder: computed('question.{isNew,answerType.id}', function() {
    let question = this.get('question');
    return question.get('isNew') && question.get('answerType.id') === undefined;
  }),

  showDataSourceSelector: computed('question.answerType', function() {
    let name = this.get('question.answerType.name');
    return name && name.includes('taxon');
  }),

  // If a question has a rule associated with it, it should automatically be set to Hidden
  hideQuestion: on(
    'afterRender',
    observer('question.{rule.isNew,rule.conditions.[]}', 'conditionsPendingSave.[]', function() {
      let question = this.get('question');
      let newRule = question.get('rule.isNew');
      let hasConditions =
        this.get('conditionsPendingSave.length') > 0 ||
        (question.get('rule') &&
          question
            .get('rule')
            .hasMany('conditions')
            .ids().length > 0);
      if (newRule === undefined) {
        newRule = true;
      }
      let toHide = !newRule || hasConditions;
      this.set('question.hidden', toHide);
    })
  ),

  saveAnswerChoiceTask: task(function*(answerChoice) {
    let question = this.get('question');
    if (question.get('isNew')) {
      // Save the answer choice after the question is saved
      if (this.get('answerChoicesPendingSave').indexOf(answerChoice) === -1) {
        this.get('answerChoicesPendingSave').pushObject(answerChoice);
      }
    } else {
      answerChoice = yield answerChoice.save();
      if (!question.get('isNew') && question.get('isValid')) {
        yield question.save();
        yield question.reload();
      }
    }
  }),

  saveConditionTask: task(function*(condition) {
    if (this.get('question.isNew') || this.get('question.rule.isNew')) {
      if (this.get('conditionsPendingSave').indexOf(condition) === -1) {
        this.get('conditionsPendingSave').pushObject(condition);
      }
    } else {
      yield condition.save();
    }
  }),

  removeConditionTask: task(function*(condition) {
    let rule = this.get('question.rule');
    if (rule.isNew || condition.get('isNew')) {
      this.get('conditionsPendingSave').removeObject(condition);
      condition.deleteRecord();
    } else {
      try {
        condition.deleteRecord();
        yield condition.save();
        yield rule.reload();
      } catch (e) {
        // If this was the last condition the API deletes the rule
        if (e.errors[0] === 'Record not found.') {
          this.store.unloadRecord(rule);
          this.set('question.rule', this.store.createRecord('rule'));
        }
      }
    }
  }),

  willDestroyElement() {
    this._super(...arguments);
    $(document).off('keydown.close-modal');
  },

  _escapeHandler(e) {
    if (e.keyCode == 27) {
      this.send('closeModal');
    }
  },

  _removeAnswerChoices() {
    let answerChoices = this.get('question.answerChoices');
    answerChoices.forEach(function(answerChoice) {
      answerChoice.deleteRecord();
      answerChoice.save();
    });
  },

  _pendingObjectsPromises(pendingObjects, toSet, objTo) {
    for (let pendingObject of pendingObjects) {
      pendingObject.set(toSet, objTo);
    }
    return pendingObjects.invoke('save');
  },

  _saveSuccess(question, promises, keepOpen) {
    question.reload().then(question => {
      let answerChoicesPendingSave = this.get('answerChoicesPendingSave');
      let conditionsPendingSave = this.get('conditionsPendingSave');

      if (!question.get('answerType.hasAnswerChoices')) {
        this._removeAnswerChoices();
      }
      promises = $.makeArray(promises);
      all(promises).then(() => {
        while (answerChoicesPendingSave.length > 0) {
          answerChoicesPendingSave.popObject();
        }
        while (conditionsPendingSave.length > 0) {
          conditionsPendingSave.popObject();
        }
        if (keepOpen) {
          if (!question.get('rule')) {
            let store = question.get('store');
            question.set('rule', store.createRecord('rule'));
          }
        } else {
          this.send('closeModal');
        }
      });
    });
  },

  _sortOrder(question) {
    let surveyTemplate = this.get('surveyTemplate');
    let lastQuestion = surveyTemplate
      .get('questions')
      .sortBy('sortOrder')
      .get('lastObject');
    question.set('sortOrder', 1);
    if (lastQuestion && lastQuestion !== question) {
      question.set('sortOrder', lastQuestion.get('sortOrder') + 1);
    }
  },

  actions: {
    setQuestionText(questionText) {
      if (this.question.isARepeater || this.question.isContainer) {
        questionText = questionText.replace(/[\/\*\[\]:\?\\]/g, ''); // eslint-disable-line no-useless-escape
      }
      set(this.question, 'questionText', questionText);
      $('[name="questionText"]').val(questionText);
    },

    sortAnswerChoices() {
      let question = this.get('question');
      let answerChoices = question.get('answerChoices');
      answerChoices.forEach((answerChoice, index) => {
        let oldSortOrder = answerChoice.get('sortOrder');
        let newSortOrder = index + 1;
        if (oldSortOrder !== newSortOrder) {
          answerChoice.set('sortOrder', newSortOrder);
          if (!answerChoice.get('isNew')) {
            answerChoice.save();
          }
        }
      });
      if (!question.get('isNew')) {
        question.reload();
      }
    },

    ancestryChange(newAncestryId) {
      let question = this.get('question');
      if (isBlank(newAncestryId)) {
        newAncestryId = null;
      }
      question.set('parentId', newAncestryId);
    },

    setAnswerType(answerTypeId) {
      let answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
      $('input[name=questionText]').focus();
    },

    // if answerType is set to anything other than Taxon single or multislect make sure data_source_id is cleared out
    checkToResetDataSource(answerTypeId) {
      if (answerTypeId != 53 || answerTypeId != 58) {
        this.set('question.dataSource', null);
      }
    },

    setDataSource(dataSourceId) {
      let dataSource = this.get('dataSources').findBy('id', dataSourceId);
      this.set('question.dataSource', dataSource);
    },

    setRuleMatchType(matchType) {
      this.set('question.rule.matchType', matchType);
    },

    save(_e, keepOpen = false) {
      let question = this.get('question');
      let surveyTemplate = this.get('surveyTemplate');
      question.set('surveyTemplate', surveyTemplate);
      if (question.validate()) {
        if (question.get('isNew') && isBlank(question.get('sortOrder'))) {
          question.set('wasNew', true);
          this._sortOrder(question);
        }
        question.save().then(
          question => {
            let promises = [];
            let answerChoicesPendingSave = this.get('answerChoicesPendingSave');
            let answerChoicesPromises = this._pendingObjectsPromises(answerChoicesPendingSave, 'question', question);

            promises = promises.concat(answerChoicesPromises);

            // We can't save the rule until there is at least one condition associated with the rule
            if (question.get('rule') && (!question.get('rule.isNew') || this.get('conditionsPendingSave.length') > 0)) {
              let conditionsPendingSave = this.get('conditionsPendingSave');
              let rule = question.get('rule');

              rule.set('question', question);
              rule.save().then(
                rule => {
                  let conditionsPromises = this._pendingObjectsPromises(conditionsPendingSave, 'rule', rule);
                  promises = promises.concat(conditionsPromises);
                  this._saveSuccess(question, promises, keepOpen);
                },
                // Rule was deleted on the server
                () => {
                  question.get('store').unloadRecord(rule);
                  question.reload().then(question => {
                    this._saveSuccess(question, [], keepOpen);
                  });
                }
              );
            } else {
              this._saveSuccess(question, promises, keepOpen);
            }
          },
          _error => {
            surveyTemplate.get('questions').removeObject(question);
          }
        );
      }
    },

    closeModal() {
      let question = this.get('question');
      if (
        !question.get('hasDirtyAttributes') ||
        window.confirm('You will lose any unsaved changes. Are you sure you want to continue?')
      ) {
        if (question.get('hasDirtyAttributes')) {
          question.rollbackAttributes();
        }
        this.get('remodal').close('question-modal');
        this.sendAction('transitionToSurveyStep');
        if (question.get('wasNew')) {
          if (testing) {
            return question.set('wasNew', false);
          }
          run.later(
            this,
            () => {
              $('html, body').animate({ scrollTop: $('.li-question.row.sortable-item:last').offset().top }, 500);
            },
            500
          );
          // Question is no longer new after shwoing the visual effect.
          run.later(
            this,
            function() {
              question.set('wasNew', false);
            },
            1500
          );
        }
      }
    }
  }
});
