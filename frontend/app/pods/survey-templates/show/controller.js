import Ember from 'ember';
const {
  computed: { alias, filterBy, sort }
} = Ember;

export default Ember.Controller.extend({
  surveyTemplate: alias('model'),
  questionsNotNew: filterBy('surveyTemplate.questions', 'isNew', false),
  questions: filterBy('questionsNotNew', 'isDeleted', false),
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('questions', 'questionsSorting')
});

