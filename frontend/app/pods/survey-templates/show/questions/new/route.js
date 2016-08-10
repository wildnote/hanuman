import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let surveyTemplate = this.modelFor('survey-templates.show');
    return Ember.RSVP.hash({
      question: this.store.createRecord('question',{surveyTemplate}),
      questions: surveyTemplate.get('questions'),
      answerTypes: this.store.findAll('answer-type'),
      surveyTemplate
    });
  },

  afterModel: function(models) {
    models.question.set('answerType',models.answerTypes.get('firstObject'));
  },

  setupController(controller, models) {
    controller.setProperties(models);
  }
});
