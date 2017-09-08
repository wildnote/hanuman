import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    let surveyTemplate = this.modelFor('survey-templates.record');
    return Ember.RSVP.hash({
      question: this.store.findRecord('question', params.question_id),
      questions: surveyTemplate.get('questions'),
      answerTypes: this.store.findAll('answer-type'),
      dataSources: this.store.findAll('data-source'),
      surveyTemplate
    });
  },

  afterModel(models) {
    let question = models.question;
    if (!question.get('rule')) {
      question.set('rule', this.store.createRecord('rule'));
    }
    return question.get('answerChoices');
  },

  setupController(controller, models) {
    controller.setProperties(models);
  }
});
