import Ember from 'ember';
const {
  computed: { alias }
} = Ember;

export default Ember.Controller.extend({
	surveyStep: alias('model')
});

