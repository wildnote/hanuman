import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    transitionToSurveyStep() {
      console.log('[EDIT CONTROLLER] transitionToSurveyStep called');
      this.transitionToRoute('survey_templates.record');
    }
  }
}); 