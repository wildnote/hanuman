import { alias, sort } from '@ember/object/computed';
import { all, task, waitForProperty } from 'ember-concurrency';
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
    const questions = this.get('surveyTemplate.questions');
    const total = questions.get('length');
    const loaded = questions.filterBy('isLoading', false).length;
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
      const confirmEl = row.querySelector('.delete-confirm');
      if (confirmEl) {
        confirmEl.style.display = 'none';
      }
    }
  }),

  _recursivelyDelete(questionId) {
    const childrenQuestions = this.get('surveyTemplate.questions').filterBy('parentId', questionId.toString());
    for (const childQuestion of childrenQuestions) {
      this._recursivelyDelete(childQuestion.get('id'));
      childQuestion.deleteRecord();
    }
  },

  deleteQuestionsTask: task(function*() {
    this.set('showConfirmDeletion', false);
    this.set('isPerformingBulk', true);

    const selectedQuestions = this.get('selectedQuestions');
    const toDeleteQuestions = this._filterSectionsAndRepeaters(selectedQuestions);
    const deleteQuestionTask = this.get('deleteQuestionTask');
    try {
      yield all(toDeleteQuestions.map((question) => deleteQuestionTask.perform(question)));
      yield this.get('updateSortOrderTask').perform(this.get('fullQuestions'), true);
      this.get('notify').success('Questions successfully deleted');
    } catch (e) {
      this.get('notify').alert('There was an error trying to delete questions');
    }
    this.unSelectAll();
    this.set('isPerformingBulk', false);
  }),

  duplicateQuestionsTask: task(function*() {
    this.set('isPerformingBulk', true);
    const selectedQuestions = this.get('selectedQuestions');
    const surveyTemplate = this.get('surveyTemplate');

    // If there are entire sections / repeaters then dont copy them all
    const toDuplicateQuestions = this._filterSectionsAndRepeaters(selectedQuestions);
    try {
      // make sure the list is clean in terms of sorting values
      yield all(
        toDuplicateQuestions.map((question) => {
          const params = { section: false };
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
      this.get('notify').alert('There was an error trying to duplicate questions');
    }
    this.unSelectAll();
    this.set('isPerformingBulk', false);
  }).drop(),

  setAncestryTask: task(function*(question, opts) {
            const ancestryQuestion = opts.target.ancestry;
    if (ancestryQuestion.collapsed) {
      this.get('collapsible').toggleCollapsed(ancestryQuestion);
      yield waitForProperty(ancestryQuestion, 'pendingRecursive', (v) => v === 0);
    }
    const parentId = ancestryQuestion.get('id');
    const parentChildren = this.get('surveyTemplate.questions')
      .filterBy('parentId', parentId)
      .sortBy('sortOrder');
    const lastChild = parentChildren.get('lastObject');
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

  checkTemplate: task(function*() {
    try {
      const surveyTemplate = this.surveyTemplate;
      surveyTemplate.set('checkingTemplate', true);
      const errors = yield surveyTemplate.checkTemplate();
      if (errors) {
        surveyTemplate.set('checkingTemplate', false);
        alert('Errors by question:' + '\n' + errors.ancestry + '\n' + errors.rule + '\n' + errors.condition);
      }
    } catch (e) {
      this.get('notify').alert('There was an error checking the template');
    }
  }),

  _filterSectionsAndRepeaters(selectedQuestions) {
    const filtered = selectedQuestions.filter(function(toCheckQuestion) {
      if (isBlank(toCheckQuestion.get('ancestry'))) {
        // top level question
        return true;
      } else if (toCheckQuestion.get('supportAncestry')) {
        // no top level question but parent
        const isMyParentSelectd = selectedQuestions.find(function(question) {
          return question.get('id') === toCheckQuestion.get('parentId');
        });
        if (!isMyParentSelectd) {
          return true;
        }
      }
      // Single question selected
      const ancestrires = toCheckQuestion.get('ancestry').split('/');
      const some = selectedQuestions.some(function(question) {
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

      const _topLevel = this.get('surveyTemplate.questions').filter((question) => {
        return question.hasChild && isBlank(question.parentId);
      });
      const allLevel = this.get('surveyTemplate.questions').filter((question) => {
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
      const selectedQuestions = this.get('selectedQuestions');
      const included = selectedQuestions.includes(question);
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

    sortedDropped(sortedQuestions, _draggedQuestion) {
      console.log('[questions-list] sortedDropped called', sortedQuestions, _draggedQuestion);
      
      // The drag-and-drop system now works with the full questions array
      // So we can directly use the sorted questions array for the sort order update
      console.log('[questions-list] Using full questions array for sort order update');
      console.log('[questions-list] Questions in new order:', sortedQuestions.map((q, index) => 
        `${index}: ${q.get('questionText')} (id: ${q.get('id')}, parentId: ${q.get('parentId')})`));
      
      // Pass the questions in the new order to updateSortOrderTask
      this.get('updateSortOrderTask').perform(sortedQuestions, false); // false = don't re-sort, use array order
    }
  }
});
