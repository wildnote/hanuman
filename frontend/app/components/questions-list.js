import Component from '@ember/component';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { alias, sort } from '@ember/object/computed';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import $ from 'jquery';

export default Component.extend({
  store: service(),
  notify: service(),

  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('surveyTemplate.filteredQuestions', 'questionsSorting'),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),

  init() {
    this._super(...arguments);
    this.selectedQuestions = A();
  },

  deleteQuestionTask: task(function*(question, row) {
    let questionId = question.get('id');
    question.deleteRecord();
    yield question.save();
    let childrenQuestions = this.get('surveyTemplate.questions').filterBy('ancestry', questionId.toString());
    for (let childQuestion of childrenQuestions) {
      childQuestion.deleteRecord();
    }
    if (row) {
      $('.delete-confirm', row).fadeOut();
    }
  }),

  deleteQuestionsTask: task(function*() {
    let selectedQuestions = this.get('selectedQuestions');

    // If there are entire sections / repeaters then dont copy them all
    let toDeleteQuestions = this._filterSectionsAndRepeaters(selectedQuestions);
    let deleteQuestionTask = this.get('deleteQuestionTask');
    try {
      yield all(toDeleteQuestions.map(question => deleteQuestionTask.perform(question)));

      this.get('notify').success('Questions successfully deleted');
    } catch (e) {
      console.log('Error:', e); // eslint-disable-line no-console
      this.get('notify').alert('There was an error trying to delete questions');
    }
    this.unSelectAll();
  }),

  duplicateQuestionsTask: task(function*() {
    let selectedQuestions = this.get('selectedQuestions');
    let store = this.get('store');
    let surveyTemplate = this.get('surveyTemplate');
    let duplicatingSection = false;

    // If there are entire sections / repeaters then dont copy them all
    let toDuplicateQuestions = this._filterSectionsAndRepeaters(selectedQuestions);

    try {
      let duplicatedResponse = yield all(
        toDuplicateQuestions.map(question => {
          let params = { section: false };
          if (question.get('isContainer') || question.get('isARepeater')) {
            params.section = true;
            duplicatingSection = true;
          }
          return question.duplicate(params);
        })
      );
      if (duplicatingSection) {
        yield surveyTemplate.reload();
        yield surveyTemplate.get('questions');
      } else {
        duplicatedResponse.forEach(response => {
          store.pushPayload(response);
          // Refactor once `ds-pushpayload-return` is enabled on ember data
          let duplicated = store.peekRecord('question', response.question.id);
          surveyTemplate.get('questions').pushObject(duplicated);
        });
      }
      this.get('notify').success('Questions successfully duplicated');
    } catch (e) {
      console.log('Error:', e); // eslint-disable-line no-console
      this.get('notify').alert('There was an error trying to duplicate questions');
    }
    this.unSelectAll();
  }).drop(),

  setAncestryTask: task(function*(question, opts) {
    let ancestryQuestion = opts.target.acenstry;
    let parentId = ancestryQuestion.get('id');
    let parentChildren = this.get('surveyTemplate.questions')
      .filterBy('parentId', parentId)
      .sortBy('sortOrder');
    let lastChild = parentChildren.get('lastObject');
    let sortOrder;
    if (lastChild) {
      sortOrder = lastChild.get('sortOrder');
    } else {
      sortOrder = ancestryQuestion.get('sortOrder') + 1;
    }

    question.setProperties({ loading: true, parentId, sortOrder });
    yield question.save();
    yield question.reload();
    yield this.get('updateSortOrderTask').perform(this.get('sortedQuestions'));
    question.set('loading', false);
  }),

  _filterSectionsAndRepeaters(selectedQuestions) {
    return selectedQuestions.filter(function(toCheckQuestion) {
      if (isBlank(toCheckQuestion.get('ancestry'))) {
        return true;
      }
      let ancestrires = toCheckQuestion.get('ancestry').split('/');
      return selectedQuestions.some(function(question) {
        ancestrires.includes(question.get('id'));
      });
    });
  },

  unSelectAll() {
    this.get('selectedQuestions').forEach(question => {
      if (!question.get('isDeleted')) {
        question.set('ancestrySelected', false);
      }
    });
    this.set('selectedQuestions', A());
  },

  actions: {
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
