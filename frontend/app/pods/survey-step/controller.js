import Ember from 'ember';
const {
  computed: { alias, filterBy, sort }
} = Ember;

export default Ember.Controller.extend({
  surveyStep: alias('model'),
  questions: filterBy('surveyStep.questions', 'isNew', false),
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('questions', 'questionsSorting')
});

