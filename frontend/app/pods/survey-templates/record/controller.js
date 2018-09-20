import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { isBlank, isPresent } from '@ember/utils';

export default Controller.extend({
  surveyTemplate: alias('model'),
  hasProjectId: window.location.href.indexOf('/projects/') !== -1,
  projectId: window.location.href.split('/')[6],

  updateSortOrderTask: task(function*(questions, reSort = false) {
    let lastSortOrder = 0;
    let surveyTemplate = this.get('surveyTemplate');
    let ids = [];
    if (reSort) {
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
    }
    for (let index = 0; index < questions.get('length'); index++) {
      let question = questions.objectAt(index);
      let oldSortOrder = question.get('sortOrder');
      let newSortOrder = index + 1;

      if (lastSortOrder === newSortOrder) {
        newSortOrder++;
      }
      if (oldSortOrder !== newSortOrder) {
        question.set('sortOrder', newSortOrder);
      }
      lastSortOrder = newSortOrder;
      ids.push(question.get('id'));
    }
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
