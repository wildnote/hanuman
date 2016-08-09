import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionToSurveyStep() {
      let surveyStep = this.modelFor('survey-step');
      this.transitionTo('survey_step',surveyStep);
    }
  }
});
