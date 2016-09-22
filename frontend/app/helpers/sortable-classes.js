import Ember from 'ember';

export function sortableClasses(params/*, hash*/) {
  let classes = 'li-question row question-border item',
      childQuestion = params[0];
  if (childQuestion) { classes += ' has-ancestry'; }
  return classes;
}

export default Ember.Helper.helper(sortableClasses);
