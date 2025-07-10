import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { isBlank, isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),
  surveyTemplate: alias('model'),
  hasProjectId: window.location.href.indexOf('/projects/') !== -1,
  projectId: window.location.href.split('/')[6],

  init() {
    console.log('🎯 RECORD CONTROLLER LOADED 3');
    this._super(...arguments);
  },

  actions: {
    transitionToSurveyStep() {
      console.log('RECOMPILE TEST - transitionToSurveyStep called!');
      // Transition back to the survey template record page
      this.get('router').transitionTo('survey-templates.record');
    }
  },

  updateSortOrderTask: task(function*(questions, reSort = false) {
    console.log('[updateSortOrderTask] Starting with questions:', questions);
    console.log('[updateSortOrderTask] reSort:', reSort);
    
    let lastSortOrder = 0;
    let surveyTemplate = this.get('surveyTemplate');
    let ids = [];
    
    if (reSort) {
      console.log('[updateSortOrderTask] Re-sorting questions by existing sortOrder');
      questions = [...questions.toArray()];
      // Re-sort
      questions.sort(function(q1, q2) {
        let q1Sort = q1.get('sortOrder');
        let q2Sort = q2.get('sortOrder');
        if (q1Sort === q2Sort) {
          return q1.get('parentId') === q2.get('id') ? 1 : -1;
        } else {
          return q1Sort - q2Sort;
        }
      });
    } else {
      console.log('[updateSortOrderTask] Using questions in provided order (from drag-and-drop)');
    }
    
    console.log('[updateSortOrderTask] Final question order:', questions.map(q => [q.get('id'), q.get('questionText')]));
    
    for (let index = 0; index < questions.get('length'); index++) {
      let question = questions.objectAt(index);
      let oldSortOrder = question.get('sortOrder');
      let newSortOrder = index + 1;

      if (lastSortOrder === newSortOrder) {
        newSortOrder++;
      }
      if (oldSortOrder !== newSortOrder) {
        console.log(`[updateSortOrderTask] Updating question ${question.get('id')} (${question.get('questionText')}) from sortOrder ${oldSortOrder} to ${newSortOrder}`);
        question.set('sortOrder', newSortOrder);
      }
      lastSortOrder = newSortOrder;
      ids.push(question.get('id'));
    }
    
    console.log('[updateSortOrderTask] Final IDs to send:', ids);
    console.log('[updateSortOrderTask] Calling surveyTemplate.resortQuestions with:', { ids });
    
    yield surveyTemplate.resortQuestions({ ids });
    this._checkAncestryConsistency(questions);
  }),

  _checkAncestryConsistency(questions) {
    questions.forEach(function(question) {
      if (isPresent(question.get('parentId'))) {
        let parentId = question.get('parentId');
        let parent = questions.findBy('id', parentId);
        let sortOrder = question.get('sortOrder');

        if (isBlank(parent)) {
          return;
        }

        if (parent.get('sortOrder') > sortOrder) {
          question.set('parentId', null);
          let questionToAskDown = questions.findBy('sortOrder', question.get('sortOrder') + 1);
          if (isPresent(questionToAskDown)) {
            question.set('parentId', questionToAskDown.get('parentId'));
          }
          question.save().then(() => {
            question.reload();
          });
        }
      }
    });
  }
});
