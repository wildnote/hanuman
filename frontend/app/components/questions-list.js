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

  // Computed property that includes all questions for drag-and-drop but maintains visual collapse
  dragDropQuestions: computed('fullQuestions.[]', 'sortedQuestions.[]', function() {
    const fullQuestions = this.get('fullQuestions');
    const sortedQuestions = this.get('sortedQuestions');
    const dragDropArray = A();

    // Add all questions in their proper order
    fullQuestions.forEach((question) => {
      dragDropArray.addObject(question);
    });

    return dragDropArray;
  }),

  isFullyEditable: alias('surveyTemplate.fullyEditable'),

  // Computed property that allows superusers to move questions even when survey is locked
  canMoveQuestions: computed('isFullyEditable', 'isSuperUser', function() {
    const isFullyEditable = this.get('isFullyEditable');
    const isSuperUser = this.get('isSuperUser');

    // Superusers can always move questions, even when survey is locked or has existing data
    if (isSuperUser) {
      return true;
    }

    // Regular users can only move questions when survey is fully editable
    return isFullyEditable;
  }),

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

      // Trigger a resort to ensure proper ordering after cloning
      yield this.get('updateSortOrderTask').perform(this.get('fullQuestions'), true);

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
      const result = yield surveyTemplate.checkTemplate();

      if (result) {
        surveyTemplate.set('checkingTemplate', false);

        let message = '';

        if (result.errors && result.errors.length > 0) {
          message += 'ERRORS:\n' + result.errors.join('\n') + '\n\n';
        }

        if (result.warnings && result.warnings.length > 0) {
          message += 'WARNINGS:\n' + result.warnings.join('\n');
        }

        if (result.valid === false) {
          alert('Form Integrity Check Failed:\n\n' + message);
        } else if (result.warnings && result.warnings.length > 0) {
          alert('Form Integrity Check Completed with Warnings:\n\n' + message);
        } else {
          alert('Form Integrity Check Passed - No issues found!');
        }

        // Refresh the survey template data after alert is dismissed
        yield surveyTemplate.reload();
        yield this.get('surveyTemplate.questions').forEach((question) => question.reload());
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

    sortedDropped(viewableSortedQuestions, _draggedQuestion) {
      const allQuestions = A(this.get('surveyTemplate.questionsNotDeleted')).sortBy('sortOrder');
      const sortableQuestions = A();

      // Handle collapsed questions. When there are questions collapsed we completely removed them from the DOM
      // so we have to re-add them so we can update the sort order attributes
      viewableSortedQuestions.forEach((viewableQuestion) => {
        sortableQuestions.addObject(viewableQuestion);
        if (viewableQuestion.get('collapsed')) {
          const id = viewableQuestion.get('id');
          const collapsedChild = allQuestions.filter((question) => {
            if (isBlank(question.get('ancestry'))) {
              return false;
            }
            const ancestrires = question.get('ancestry').split('/');
            return ancestrires.includes(id);
          });
          sortableQuestions.addObjects(collapsedChild);
        }
      });

      this.get('updateSortOrderTask').perform(sortableQuestions);
    },

    dragStarted(question) {
      const targets = this.element.querySelectorAll('.draggable-object-target');
      targets.forEach((target) => {
        const parent = target.parentElement;
        if (parent && !parent.classList.contains(`model-id-${question.get('parentId')}`)) {
          parent.classList.add('dragging-coming-active');
        }
      });
    },

    dragEnded() {
      const targets = this.element.querySelectorAll('.draggable-object-target');
      targets.forEach((target) => {
        const parent = target.parentElement;
        if (parent) {
          parent.classList.remove('dragging-coming-active');
        }
      });
    },

    dragOver() {
      run.next(this, function() {
        const targets = this.element.querySelectorAll('.accepts-drag');
        targets.forEach((target) => {
          const parent = target.parentElement;
          if (parent) {
            parent.classList.add('dragging-over');
          }
        });
      });
    },

    dragOut() {
      const targets = this.element.querySelectorAll('.draggable-object-target');
      targets.forEach((target) => {
        const parent = target.parentElement;
        if (parent) {
          parent.classList.remove('dragging-over');
        }
      });
    }
  }
});
