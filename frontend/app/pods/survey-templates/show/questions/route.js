import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionToSurveyStep() {
      let surveyTemplate = this.modelFor('survey-templates.show');
      this.transitionTo('survey_templates.show',surveyTemplate);
    }
  }
});
