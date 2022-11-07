import { alias, sort } from '@ember/object/computed';
import { all, task, waitForProperty } from 'ember-concurrency';

import $ from 'jquery';
import { A } from '@ember/array';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default Component.extend({
  remodal: service(),
  notify: service(),
  collapsible: service(),

  isLoadingQuestions: true,
  isPerformingBulk: false,
  allCollapsed: false,

  questionsSorting: ['sortOrder'],
  fullQuestions: sort('surveyTemplate.questionsNotDeleted', 'questionsSorting'),
  sortedQuestions: sort('surveyTemplate.filteredQuestions', 'questionsSorting'),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),

  init() {
    this._super(...arguments);
    this.selectedQuestions = A();
  },

  togglingAny: computed('surveyTemplate.questions.@each.pendingRecursive', function() {
    return this.get('surveyTemplate.questions').any((question) => question.pendingRecursive > 0);
  }),

  loadingProgress: computed('surveyTemplate.questions.@each.isLoading', function() {
    let questions = this.get('surveyTemplate.questions');
    let total = questions.get('length');
    let loaded = questions.filterBy('isLoading', false).length;
    if (total === loaded) {
      run.next(this, function() {
        this.set('isLoadingQuestions', false);
      });
    }
    return parseInt((loaded * 100) / total);
  }),

  deleteQuestionTask: task(function*(question, row) {
    question.deleteRecord();
    yield question.save();
    this._recursivelyDelete(question.get('id'));
    if (row) {
      $('.delete-confirm', row).fadeOut();
    }
  }),

  _recursivelyDelete(questionId) {
    let childrenQuestions = this.get('surveyTemplate.questions').filterBy('parentId', questionId.toString());
    for (let childQuestion of childrenQuestions) {
      this._recursivelyDelete(childQuestion.get('id'));
      childQuestion.deleteRecord();
    }
  },

  deleteQuestionsTask: task(function*() {
    this.set('showConfirmDeletion', false);
    this.set('isPerformingBulk', true);

    let selectedQuestions = this.get('selectedQuestions');
    let toDeleteQuestions = this._filterSectionsAndRepeaters(selectedQuestions);
    let deleteQuestionTask = this.get('deleteQuestionTask');
    try {
      yield all(toDeleteQuestions.map((question) => deleteQuestionTask.perform(question)));
      yield this.get('updateSortOrderTask').perform(this.get('fullQuestions'), true);
      this.get('notify').success('Questions successfully deleted');
    } catch (e) {
      console.log('Error:', e); // eslint-disable-line no-console
      this.get('notify').alert('There was an error trying to delete questions');
    }
    this.unSelectAll();
    this.set('isPerformingBulk', false);
  }),

  duplicateQuestionsTask: task(function*() {
    this.set('isPerformingBulk', true);
    let selectedQuestions = this.get('selectedQuestions');
    let surveyTemplate = this.get('surveyTemplate');

    // If there are entire sections / repeaters then dont copy them all
    let toDuplicateQuestions = this._filterSectionsAndRepeaters(selectedQuestions);
    try {
      // make sure the list is clean in terms of sorting values
      yield all(
        toDuplicateQuestions.map((question) => {
          let params = { section: false };
          if (question.get('isContainer') || question.get('isARepeater')) {
            params.section = true;
          }
          return question.duplicate(params);
        })
      );
      yield surveyTemplate.reload();
      yield surveyTemplate.hasMany('questions').reload();
      this.get('notify').success('Questions successfully duplicated');
    } catch (e) {
      console.log('Error:', e); // eslint-disable-line no-console
      this.get('notify').alert('There was an error trying to duplicate questions');
    }
    this.unSelectAll();
    this.set('isPerformingBulk', false);
  }).drop(),

  setAncestryTask: task(function*(question, opts) {
    let ancestryQuestion = opts.target.acenstry;
    if (ancestryQuestion.collapsed) {
      this.get('collapsible').toggleCollapsed(ancestryQuestion);
      yield waitForProperty(ancestryQuestion, 'pendingRecursive', (v) => v === 0);
    }
    let parentId = ancestryQuestion.get('id');
    let parentChildren = this.get('surveyTemplate.questions')
      .filterBy('parentId', parentId)
      .sortBy('sortOrder');
    let lastChild = parentChildren.get('lastObject');
    let sortOrder;
    if (lastChild) {
      sortOrder = lastChild.get('sortOrder');
    } else {
      sortOrder = ancestryQuestion.get('sortOrder') + 0.1;
    }
    question.setProperties({ loading: true, parentId, sortOrder });
    yield question.save();
    yield question.reload();
    yield ancestryQuestion.reload();
    yield this.get('updateSortOrderTask').perform(this.get('fullQuestions'), true);
    question.set('loading', false);
  }),

  checkTemplate: task(function* () {
    try {

      let surveyTemplate = this.surveyTemplate;
      surveyTemplate.set('checkingTemplate', true);
      let errors = yield surveyTemplate.checkTemplate();
      if(errors) {
        surveyTemplate.set('checkingTemplate', false);
      }
      console.log("errors");
      console.log(errors);
      alert("Errors by question:" + "\n" + errors.ancestry + "\n" + errors.rule + "\n" + errors.condition );
    } catch (e) {
      console.log('Error checking template:', e); // eslint-disable-line no-console
    }
  }),

  _filterSectionsAndRepeaters(selectedQuestions) {
    let filtered = selectedQuestions.filter(function(toCheckQuestion) {
      if (isBlank(toCheckQuestion.get('ancestry'))) {
        // top level question
        return true;
      } else if (toCheckQuestion.get('supportAncestry')) {
        // no top level question but parent
        let isMyParentSelectd = selectedQuestions.find(function(question) {
          return question.get('id') === toCheckQuestion.get('parentId');
        });
        if (!isMyParentSelectd) {
          return true;
        }
      }
      // Single question selected
      let ancestrires = toCheckQuestion.get('ancestry').split('/');
      let some = selectedQuestions.some(function(question) {
        return ancestrires.includes(`${question.get('id')}`);
      });
      return !some;
    });
    return isBlank(filtered) ? selectedQuestions : filtered;
  },

  unSelectAll() {
    this.get('selectedQuestions').forEach((question) => {
      if (!question.get('isDeleted')) {
        question.set('ancestrySelected', false);
      }
    });
    this.set('selectedQuestions', A());
  },

  actions: {
    toggleAllCollapsed() {
      this.toggleProperty('allCollapsed');

      let topLevel = this.get('surveyTemplate.questions').filter((question) => {
        return question.hasChild && isBlank(question.parentId);
      });
      let allLevel = this.get('surveyTemplate.questions').filter((question) => {
        return question.hasChild;
      });
      allLevel.forEach((question) => {
        this.get('collapsible').toggleCollapsed(question, !this.allCollapsed);
      });
    },

    openTaggingModal() {
      this.set('showingTaggingModal', true);
      run.next(() => {
        this.get('remodal').open('tagging-modal');
      });
    },
    clearAll() {
      // Clean state
      this.unSelectAll();
    },
    toggleQuestion(question, add = true) {
      let selectedQuestions = this.get('selectedQuestions');
      let included = selectedQuestions.includes(question);
      if (add && !included) {
        selectedQuestions.addObject(question);
      } else if (!add && included) {
        selectedQuestions.removeObject(question);
      }
    },
    deleteQuestion(question, elRow) {
      this.get('deleteQuestionTask').perform(question, elRow);
      this.set('selectedQuestions', A());
      this.get('updateSortOrderTask').perform(this.get('fullQuestions'), true);
    },

    sortedDropped(viewableSortedQuestions, _draggedQuestion) {
      let allQuestions = A(this.get('surveyTemplate.questionsNotDeleted')).sortBy('sortOrder');
      let sortableQuestions = A();
      // Handle collapsed question. When there are questions collapsed we completely removed them from the DOM
      // so we have to re-add them so we can update the sort order attributes
      viewableSortedQuestions.forEach((viewableQuestion) => {
        sortableQuestions.addObject(viewableQuestion);
        if (viewableQuestion.get('collapsed')) {
          let id = viewableQuestion.get('id');
          let collapsedChild = allQuestions.filter((question) => {
            if (isBlank(question.get('ancestry'))) {
              return false;
            }
            let ancestrires = question.get('ancestry').split('/');
            return ancestrires.includes(id);
          });
          sortableQuestions.addObjects(collapsedChild);
        }
      });
      this.get('updateSortOrderTask').perform(sortableQuestions);
    },

    dragStarted(question) {
      $('.draggable-object-target')
        .parent(`:not(.model-id-${question.get('parentId')})`)
        .addClass('dragging-coming-active');
    },
    dragEnded() {
      $('.draggable-object-target')
        .parent()
        .removeClass('dragging-coming-active');
    },
    dragOver() {
      run.next(this, function() {
        $('.accepts-drag')
          .parent()
          .addClass('dragging-over');
      });
    },
    dragOut() {
      $('.draggable-object-target')
        .parent()
        .removeClass('dragging-over');
    }
  }
});
