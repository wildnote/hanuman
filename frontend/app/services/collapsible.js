import Service from '@ember/service';
import { run } from '@ember/runloop';

export default Service.extend({
  toggleCollapsed(question, collapsedValue) {
    if (collapsedValue !== undefined && question.get('collapsed') === collapsedValue) {
      return;
    }
    let collapsed = question.get('collapsed');
    question.set('collapsed', !collapsed);
    question.set('pendingRecursive', 1);
    // Toggle children questions
    run.next(this, function() {
      this._collapseChild(question, question.get('child'), !collapsed);
    });
  },

  _collapseChild(topParent, questions, collapsedValue) {
    questions.forEach((question) => {
      question.set('ancestryCollapsed', collapsedValue);
      if (question.get('hasChild') && !question.get('collapsed')) {
        topParent.incrementProperty('pendingRecursive');
        run.next(this, function() {
          this._collapseChild(topParent, question.get('child'), collapsedValue);
        });
      }
    });
    topParent.decrementProperty('pendingRecursive');
  }
});
