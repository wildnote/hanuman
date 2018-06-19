import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Mixin.create({
  notify: service('notify'),

  saveSurveyTemplateTask: task(function*() {
    let surveyTemplate = this.currentModel;
    try {
      surveyTemplate = yield surveyTemplate.save();
      this.transitionTo('survey_templates.record', surveyTemplate);
    } catch (e) {
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
