import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let surveyTemplate = this.modelFor('survey-templates.record');
    return Ember.RSVP.hash({
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
