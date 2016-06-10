import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return Ember.RSVP.hash({
      question: this.store.findRecord('question', params.question_id),
      answerTypes: this.store.findAll('answer-type')
    });
  },

  setupController(controller, models) {
    controller.setProperties(models);
  },

  actions: {
    transitionToSurveyStep() {
      this.transitionTo('survey_step',this.currentModel.question.get('surveyStep'));
    }
  }
});
