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
    
    console.log('[questions-list] dragDropQuestions computed - full count:', fullQuestions.length, 'visible count:', sortedQuestions.length, 'drag-drop count:', dragDropArray.length);
    
    return dragDropArray;
  }),
  
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
      
      // The drag-and-drop system works with the full questions array
      // We need to include all descendants of moved containers for proper sort order updates
      console.log('[questions-list] Using full questions array for sort order update');
      console.log('[questions-list] Questions in new order:', sortedQuestions.map((q, index) => 
        `${index}: ${q.get('questionText')} (id: ${q.get('id')}, parentId: ${q.get('parentId')})`));
      
      // Get all questions to find descendants
      const allQuestions = this.get('fullQuestions');
      const completeArray = [...sortedQuestions.toArray()];
      const processedIds = new Set();
      
      // Add all questions from sortedQuestions to processed set
      sortedQuestions.forEach(q => processedIds.add(q.get('id')));
      
      // Find all moved containers (questions with children)
      const movedContainers = sortedQuestions.filter(q => q.get('hasChild'));
      
      console.log('[questions-list] Found moved containers:', movedContainers.map(c => ({
        id: c.get('id'),
        text: c.get('questionText'),
        hasChild: c.get('hasChild')
      })));
      
      // For each moved container, find and add all descendants
      movedContainers.forEach(container => {
        const descendants = allQuestions.filter(q => {
          if (!q.get('ancestry')) return false;
          const ancestries = q.get('ancestry').split('/');
          return ancestries.includes(container.get('id').toString());
        });
        
        console.log('[questions-list] Found descendants for container', container.get('id'), ':', descendants.map(d => ({
          id: d.get('id'),
          text: d.get('questionText'),
          ancestry: d.get('ancestry')
        })));
        
        // Add descendants that aren't already in the array
        descendants.forEach(desc => {
          if (!processedIds.has(desc.get('id'))) {
            completeArray.push(desc);
            processedIds.add(desc.get('id'));
          }
        });
      });
      
      // Instead of sorting by existing sort order, we need to update sort orders
      // to reflect the new positions from the drag-and-drop
      console.log('[questions-list] Updating sort orders for all questions including descendants');
      
      // Create a map of question ID to its new position in the sortedQuestions array
      const newPositions = new Map();
      sortedQuestions.forEach((question, index) => {
        newPositions.set(question.get('id'), index);
      });
      
      // Update sort orders for all questions in the complete array
      completeArray.forEach((question, index) => {
        const questionId = question.get('id');
        const newPosition = newPositions.get(questionId);
        
        if (newPosition !== undefined) {
          // This question was in the drag-and-drop array, use its new position
          const newSortOrder = newPosition + 1;
          console.log('[questions-list] Updating question', question.get('questionText'), 'to sort order', newSortOrder);
          question.set('sortOrder', newSortOrder);
        } else {
          // This is a descendant that wasn't in the drag-and-drop array
          // Find its parent and position it after the parent
          const parentId = question.get('parentId');
          if (parentId) {
            const parent = completeArray.find(q => q.get('id') === parentId);
            if (parent) {
              const parentSortOrder = parent.get('sortOrder');
              // Position descendants after their parent with a small offset
              const newSortOrder = parentSortOrder + 0.1;
              console.log('[questions-list] Updating descendant', question.get('questionText'), 'to sort order', newSortOrder, 'after parent', parent.get('questionText'));
              question.set('sortOrder', newSortOrder);
            }
          }
        }
      });
      
      // Sort the complete array by the new sort orders
      completeArray.sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
      
      console.log('[questions-list] Final complete array with updated sort orders:', completeArray.map((q, index) => 
        `${index}: ${q.get('questionText')} (id: ${q.get('id')}, parentId: ${q.get('parentId')}, sortOrder: ${q.get('sortOrder')})`));
      
      // Pass the complete array to updateSortOrderTask
      this.get('updateSortOrderTask').perform(completeArray, false); // false = don't re-sort, use array order
    }
  }
});
