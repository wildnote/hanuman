import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let surveyStep = this.modelFor('survey-step');
    return Ember.RSVP.hash({
      question: this.store.createRecord('question',{surveyStep}),
      answerTypes: this.store.findAll('answer-type'),
      surveyTemplate: surveyStep.get('surveyTemplate'),
      surveyStep
    });
  },

  afterModel: function(models) {
    models.question.set('answerType',models.answerTypes.get('firstObject'));
  },

  setupController(controller, models) {
    controller.setProperties(models);
  }
});
