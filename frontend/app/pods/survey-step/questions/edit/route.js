import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    let surveyStep = this.modelFor('survey-step');
    return Ember.RSVP.hash({
      question: this.store.findRecord('question', params.question_id),
      answerTypes: this.store.findAll('answer-type'),
      surveyTemplate: surveyStep.get('surveyTemplate')
    });
  },

  afterModel: function(models) {
    return models.question.get('answerChoices');
  },

  setupController(controller, models) {
    controller.setProperties(models);
  }
});
