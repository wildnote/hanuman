import Route from '@ember/routing/route';
import SurveyTemplateSaveRoute from 'frontend/mixins/survey-template-save-route';

export default Route.extend(SurveyTemplateSaveRoute, {
  model() {
    return this.store.createRecord('survey-template');
  }
});
