import Ember from 'ember';
const {
  computed: { alias }
} = Ember;

export default Ember.Component.extend({
  remodal: Ember.inject.service(),
  isFullyEditable: alias('question.surveyStep.surveyTemplate.fullyEditable'),

  didRender() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      this.get('remodal').open('question-modal');
    });
  },

  actions: {
    setAnswerType(answerTypeId) {
      const answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
    }
  }
});
