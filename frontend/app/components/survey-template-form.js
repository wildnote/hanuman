import Component from '@ember/component';
import SurveyTemplate from '../models/survey-template';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  ajax: service(),
  statuses: SurveyTemplate.STATUSES,

  init() {
    this._super(...arguments);
    this.get('loadCompaniesTask').perform();
    this.get('loadExportTypesTask').perform();
  },

  loadCompaniesTask: task(function*() {
    try {
      let response = yield this.get('ajax').request('/organizations');
      this.set('organizations', response.organizations);
    } catch (e) {
      this.get('notify').alert('There was an error trying to load the organizations');
    }
  }).drop(),

  loadExportTypesTask: task(function*() {
    try {
      let response = yield this.get('ajax').request('/survey_template_export_types');
      this.set('exportTypes', response.survey_template_export_types);
    } catch (e) {
      this.get('notify').alert('There was an error trying to load the export types');
    }
  }).drop(),

  actions: {
    setStatus(status) {
      let surveyTemplate = this.get('surveyTemplate');
      surveyTemplate.set('status', status);
    }
  }
});
