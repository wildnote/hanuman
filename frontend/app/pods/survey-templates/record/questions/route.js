import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function(){
    console.log("rendering thing");
    this.render({outlet: 'questions'});
  },
  actions: {
    transitionToSurveyStep() {
      let surveyTemplate = this.modelFor('survey-templates.record');
      this.transitionTo('survey_templates.record',surveyTemplate);
    }
  }
});
