import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    let surveyTemplate = this.modelFor('survey-templates.record');
    return hash({
      question: this.store.createRecord('question', { surveyTemplate }),
      questions: surveyTemplate.get('questions'),
      answerTypes: this.store.findAll('answer-type', { reload: true }),
      dataSources: this.store.findAll('data-source'),
      surveyTemplate
    });
  },

  setupController(controller, models) {
    controller.setProperties(models);
  },

  actions: {
    transitionToSurveyStep() {
      console.log('[NEW ROUTE] transitionToSurveyStep called');
      let surveyTemplate = this.modelFor('survey-templates.record');
      console.log('[NEW ROUTE] surveyTemplate:', surveyTemplate);
      console.log('[NEW ROUTE] About to transition to survey_templates.record');
      this.transitionTo('survey_templates.record', surveyTemplate);
      console.log('[NEW ROUTE] Transition completed');
    }
  }
});
