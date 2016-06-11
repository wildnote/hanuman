import Ember from 'ember';
const {
  computed: { alias, filterBy }
} = Ember;

export default Ember.Controller.extend({
	surveyStep: alias('model'),
	questions: filterBy('surveyStep.questions', 'isNew', false)
});

