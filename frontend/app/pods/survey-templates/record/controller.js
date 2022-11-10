import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { isBlank, isPresent } from '@ember/utils';

export default Controller.extend({
  surveyTemplate: alias('model'),
  hasProjectId: window.location.href.indexOf('/projects/') !== -1,
  projectId: window.location.href.split('/')[6],

  updateSortOrderTask: task(function*(questions, reSort = false, ancestryQuestion = null) {
    let topLevelSection;
    if (ancestryQuestion && ancestryQuestion.get('answerType').get('name') === 'section') {
      if (!(ancestryQuestion.get('parentId') && questions.findBy('id', ancestryQuestion.get('parentId')).get('answerType').get('name') === 'repeater')) {
        topLevelSection = true;
      }
    } else {
      topLevelSection = false;
    }

    // dragging out of repeater to top level by ordering it ahead of repeater
    if (!this._allowedDrag(questions, ancestryQuestion)) {
      // alert("Questions cannot be moved out of repeaters once there is data submitted on a Survey Form. Plese delete the question if you no longer want it in the repeater. Warning, this is destructive and may lead to loss of data!");
      this.get('surveyTemplate').toggleWarning(
        `<span>Questions cannot be moved out of repeaters once there is data submitted on a Survey Form.</span><br>
        <span>Plese delete the question if you no longer want it in the repeater. Warning, this is destructive and may lead to loss of data!</span><br>`
      );
      return;
    }

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

  _allowedDrag(questions, ancestryQuestion) {
    let fullyEditable = this.get('surveyTemplate').fullyEditable;

    let fakeQuestions = [];
    questions.forEach(function(question) {
      let fakeQuestion = {
        'id': question.get('id'),
        'sortOrder': question.get('sortOrder'),
        'parentId': question.get('parentId'),
        'ancestry': question.get('ancestry'),
        'answerTypeName': question.get('answerType').get('name')
      };
      fakeQuestions.push(fakeQuestion);
    });

    let lastSortOrder = 0;

    for (let index = 0; index < fakeQuestions.length; index++) {
      let question = fakeQuestions.objectAt(index);
      let oldSortOrder = question.sortOrder;
      let newSortOrder = index + 1;

      if (lastSortOrder === newSortOrder) {
        newSortOrder++;
      }
      if (oldSortOrder !== newSortOrder) {
        question.sortOrder = newSortOrder;
      }
      lastSortOrder = newSortOrder;
    }

    let pass = true;


    // top level section or section in section case
    if (fullyEditable || (ancestryQuestion && ancestryQuestion.get('answerType').get('name') === 'section')) {
      if (fullyEditable || !(ancestryQuestion.get('parentId') && questions.findBy('id', ancestryQuestion.get('parentId')).get('answerType').get('name') === 'repeater')) {
        fakeQuestions.forEach(function (question) {
          let prevQ = fakeQuestions.findBy('sortOrder', question.sortOrder - 1);
          let nextQ = fakeQuestions.findBy('sortOrder', question.sortOrder + 1);

          if (question.parentId) {
            let parent = fakeQuestions.findBy('id', question.parentId);

            if (parent.sortOrder > question.sortOrder) {
              pass = true;
            } else if (prevQ === parent) {
              pass = true;
            } else if (prevQ.ancestry && prevQ.ancestry === question.ancestry) {
              pass = true;
            } else {
              pass = false;
            }
          }
        });
        return pass;
      }
    }

    fakeQuestions.forEach(function (question) {
      let prevQ = fakeQuestions.findBy('sortOrder', question.sortOrder - 1);
      let nextQ = fakeQuestions.findBy('sortOrder', question.sortOrder + 1);

      if (question.parentId) {
        let parent = fakeQuestions.findBy('id', question.parentId);
        
        if (parent.sortOrder > question.sortOrder) {
          pass = false;
        } else if (prevQ && prevQ !== parent && prevQ.ancestry && prevQ.ancestry !== question.ancestry) {
          if (!prevQ.ancestry.includes(question.parentId)) {
            pass = false;
          }
        }
      } else if (nextQ && nextQ.ancestry && !['section', 'repeater'].includes(question.answerTypeName)) {
        pass = false;
      }
    });
    return pass;
  },

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
          parent.save().then(() => {
            parent.reload();
          });
        }
      }
    });
  }
});
