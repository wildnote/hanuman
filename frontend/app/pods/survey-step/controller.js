import Ember from 'ember';
const {
  computed: { alias, filterBy, sort }
} = Ember;

export default Ember.Controller.extend({
  surveyStep: alias('model'),
  questionsNotNew: filterBy('surveyStep.questions', 'isNew', false),
  questions: filterBy('questionsNotNew', 'isDeleted', false),
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('questions', 'questionsSorting')
});

