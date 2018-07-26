import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

import config from 'frontend/config/environment';

export default Route.extend({
  notify: service(),

  afterModel(model) {
    let promises = [];
    // load answer-types
    promises.push(this.store.findAll('answer-Type'));
    // load questions
    promises.push(model.get('questions'));

    return promises;
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
