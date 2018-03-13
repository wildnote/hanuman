import Route from '@ember/routing/route';

export default Route.extend({
  renderTemplate() {
    this.render({ outlet: 'questions' });
  },
  actions: {
    transitionToSurveyStep() {
      let surveyTemplate = this.modelFor('survey-templates.record');
      this.transitionTo('survey_templates.record', surveyTemplate);
    }
  }
});
