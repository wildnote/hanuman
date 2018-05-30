import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { isBlank, isPresent } from '@ember/utils';

export default Controller.extend({
  isLoadingQuestions: true,
  surveyTemplate: alias('model'),

  updateSortOrderTask: task(function*(questions) {
    let lastSortOrder = 0;

    for (let index = 0; index < questions.get('length'); index++) {
      let question = questions.objectAt(index);
      let oldSortOrder = question.get('sortOrder');
      let newSortOrder = index + 1;
      if (lastSortOrder === newSortOrder) {
        newSortOrder++;
      }
      if (oldSortOrder !== newSortOrder) {
        question.set('sortOrder', newSortOrder);
        yield question.save();
      }
      lastSortOrder = newSortOrder;
    }
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
