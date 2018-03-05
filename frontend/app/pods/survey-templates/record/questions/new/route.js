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
  }
});
