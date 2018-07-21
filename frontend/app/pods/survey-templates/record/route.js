import Route from '@ember/routing/route';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import config from 'frontend/config/environment';

export default Route.extend({
  notify: service(),
  setupController(controller, model) {
    this._super(controller, model);
    // Progress bar indicators
    let i = 0;
    let p = 0;
    let surveyTemplate = model;
    let questionIds = surveyTemplate.hasMany('questions').ids();
    let total = questionIds.length;
    if (total === 0) {
      controller.set('isLoadingQuestions', false);
    } else {
      let maxLength = 50;

      let questionGroups = questionIds.reduce((all, one, i) => {
        let ch = Math.floor(i / maxLength);
        all[ch] = [].concat(all[ch] || [], one);
        return all;
      }, []);
      total = questionGroups.length;
      questionGroups.forEach(questionGroup => {
        if (isBlank(questionGroup)) {
          i += 1;
          return;
        }
        this.store.query('question', { ids: questionGroup }).then(function() {
          let pp = p;
          i += 1;
          p = (i * 10) / total - (((i * 10) / total) % 0.5);
          if (pp !== p) {
            controller.set('loadingProgress', p * 10 + 5);
          }
          if (i + 1 >= total) {
            run.next(this, function() {
              controller.set('isLoadingQuestions', false);
            });
          }
        });
      });
    }
  },

  actions: {
    reorderQuestions(questions) {
      this.controller.get('updateSortOrderTask').perform(questions);
    },
    duplicate() {
      let indexController = this.controllerFor('survey-templates.record.index');
      let surveyTemplate = this.currentModel;
      indexController.send('toggleBtnLoading', 'duplicate');
      surveyTemplate
        .duplicate()
        .then(duplicateReponse => {
          this.transitionTo('survey_templates.record', duplicateReponse.survey_template.id);
          run.later(
            this,
            () => {
              this.get('notify').success('Survey Template successfully duplicated.');
            },
            1000
          );
        })
        .catch(_error => {
          this.get('notify').alert('There was an error trying to duplicate this Survey Template');
        })
        .finally(() => {
          run.later(
            this,
            () => {
              indexController.send('toggleBtnLoading', 'duplicate');
            },
            1500
          );
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
        error => {
          console.log(error); // eslint-disable-line no-console
          if (error.errors[0].detail.detail == 'associated-data-restriction') {
            this.get('notify').alert(
              'Survey template cannot be deleted as it has associated survey data. To complete deletion first delete survey data.',
              {
                closeAfter: 5000
              }
            );
          } else {
            this.get('notify').alert('There was an error trying to delete this Survey Template', {
              closeAfter: 5000
            });
          }
          run.later(
            this,
            () => {
              return indexController.send('toggleBtnLoading', 'delete');
            },
            1000
          );
        }
      );
    }
  }
});
