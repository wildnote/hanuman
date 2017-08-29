import Ember from 'ember';
import config from 'frontend/config/environment';

const {
  Route,
  run,
  isPresent,
  isBlank,
  inject
} = Ember;

export default Route.extend({
  notify: inject.service('notify'),
  setupController(controller, model) {
    this._super(controller, model);
    // Progress bar indicators
    let i = 0;
    let p = 0;
    let surveyTemplate = model;
    let total = surveyTemplate.get('questions.length');
    if (total === 0) {
      controller.set('isLoadingQuestions', false);
    } else {
      surveyTemplate.hasMany('questions').ids().forEach((questionId) => {
        if (!questionId) {
          i += 1;
          return;
        }
        this.store.findRecord('question', questionId).then(function() {
          let pp = p;
          i += 1;
          p = (((i * 10 / total) - ((i * 10 / total) % 0.5)));
          if (pp !== p) {
            controller.set('loadingProgress', ((p * 10) + 5));
          }
          if ((i + 1) >= total) {
            run.next(this, function() {
              controller.set('isLoadingQuestions', false);
            });
          }
        });
      });
    }
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
          question.save().then(()=>{
            question.reload();
          });
        }
      }
    });
  },

  actions: {
    reorderQuestions(questions) {
      this.send('updateSortOrder', questions);
    },

    updateSortOrder(questions) {
      let lastSortOrder = 0;
      questions.forEach((question, index) => {
        let oldSortOrder = question.get('sortOrder');
        let newSortOrder = index + 1;
        if (lastSortOrder === newSortOrder) {
          newSortOrder++;
        }
        if (oldSortOrder !== newSortOrder) {
          question.set('sortOrder', newSortOrder);
          question.save();
        }
        lastSortOrder = newSortOrder;
      });
      this._checkAncestryConsistency(questions);
    },
    duplicate() {
      let indexController = this.controllerFor('survey-templates.record.index');
      let surveyTemplate = this.currentModel;
      indexController.send('toggleBtnLoading', 'duplicate');
      surveyTemplate.duplicate().then((duplicateReponse) => {
        this.transitionTo('survey_templates.record', duplicateReponse.survey_template.id);
        run.later(this, ()=> {
          this.get('notify').success('Survey Template successfully duplicated.');
        }, 1000);
      }).catch((_error) => {
        this.get('notify').alert('There was an error trying to duplicate this Survey Template');
      }).finally(() => {
        run.later(this, ()=> {
          indexController.send('toggleBtnLoading', 'duplicate');
        }, 1500);
      });
    },
    delete() {
      let indexController = this.controllerFor('survey-templates.record.index');
      let surveyTemplate = this.currentModel;
      indexController.send('toggleBtnLoading', 'delete');
      surveyTemplate.deleteRecord();
      surveyTemplate.save().then(
        () => {
          if (config.environment !== 'test') {
            window.location.replace('/hanuman/survey_templates');
          }
        },
        (error)=>{
          console.log(error);
          if(error.errors[0].detail.detail == "associated-data-restriction") {
            this.get('notify').alert('Survey template cannot be deleted as it has associated survey data. To complete deletion first delete survey data.', {
              closeAfter: 5000
            });
          }
          else {
            this.get('notify').alert('There was an error trying to delete this Survey Template', {
              closeAfter: 5000
            });
          }
          run.later(this ,()=> { indexController.send('toggleBtnLoading','delete'); }, 1000);
        }
      );
    }
  }
});
