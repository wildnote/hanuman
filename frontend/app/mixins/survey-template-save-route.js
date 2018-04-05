import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Mixin.create({
  ajax: service(),
  notify: service('notify'),
  setupController(controller, model) {
    this._super(controller, model);
    return this.get('ajax').request('/organizations').then((response) =>{
      return controller.set('organizations', response.organizations);
    });
  },

  saveSurveyTemplateTask: task(function*() {
    let surveyTemplate = this.currentModel;
    try {
      surveyTemplate = yield surveyTemplate.save();
      this.transitionTo('survey_templates.record', surveyTemplate);
    } catch(e) {
      this.get('notify').alert('There was an error trying to save this Survey Template');
    }
  }).drop(),

  actions: {
    save() {
      let surveyTemplate = this.currentModel;
      if (surveyTemplate.validate()) {
        this.get('saveSurveyTemplateTask').perform();
      }
    }
  }
});
