import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    let surveyTemplate = this.modelFor('survey-templates.record');
    return hash({
      question: this.store.findRecord('question', params.question_id),
      questions: surveyTemplate.get('questions'),
      answerTypes: this.store.findAll('answer-type'),
      dataSources: this.store.findAll('data-source'),
      surveyTemplate
    });
  },

  setupController(controller, models) {
    controller.setProperties(models);
  },

  actions: {
    transitionToSurveyStep() {
      console.log('[EDIT ROUTE] transitionToSurveyStep called');
      let surveyTemplate = this.modelFor('survey-templates.record');
      console.log('[EDIT ROUTE] surveyTemplate:', surveyTemplate);
      console.log('[EDIT ROUTE] About to transition to survey_templates.record');
      this.transitionTo('survey_templates.record', surveyTemplate);
      console.log('[EDIT ROUTE] Transition completed');
    }
  }
});
