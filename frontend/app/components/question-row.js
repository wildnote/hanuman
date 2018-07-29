import Component from '@ember/component';
import { or } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  attributeBindings: ['question.id:data-question-id'],

  isPreviewing: false,
  isPreviewable: or('question.isTaxonType', 'question.answerType.hasAnswerChoices'),
  pendingRecursive: 0,

  isSelected: computed('selectedQuestions.[]', 'question.id', function() {
    let selectedQuestions = this.get('selectedQuestions');
    let questionId = this.get('question.id');
    return selectedQuestions.some(question => question.get('id') === questionId);
  }),

  typeInitial: computed('question.{ancestry,hidden,required,rule.isNew}', function() {
    let question = this.get('question');
    let intial = '';
    if (question.get('hidden')) {
      intial += '<span class="label label-default">Hidden</span>';
    }
    if (question.get('required')) {
      intial += '<span class="label label-danger">Required</span>';
    }
    if (question.get('rule') && !question.get('rule.isNew')) {
      intial += `<span class="label label-info">Rules</span>`;
    }
    return htmlSafe(intial);
  }),

  totalChildren: computed('otherQuetions.@each.ancestry', 'question.id', function() {
    let questionId = this.get('question.id');
    return this.get('otherQuetions').filter(question => question.get('ancestry') === questionId).length;
  }),

  _collapseChild(questions, collapsedValue) {
    questions.forEach(question => {
      question.set('ancestryCollapsed', collapsedValue);
      if (question.get('hasChild') && !question.get('collapsed')) {
        this.incrementProperty('pendingRecursive');
        run.next(this, function() {
          this._collapseChild(question.get('child'), collapsedValue);
        });
      }
    });
    this.decrementProperty('pendingRecursive');
  },

  actions: {
    confirm() {
      let el = this.get('element');
      let $confirm = $('.delete-confirm', el);
      $confirm.fadeIn();
    },
    cancel() {
      let el = this.get('element');
      let $confirm = $('.delete-confirm', el);
      $confirm.fadeOut();
    },
    delete() {
      let question = this.get('question');
      let el = this.get('element');
      this.sendAction('deleteQuestion', question, el);
    },

    toggleCollapsed() {
      let question = this.get('question');
      let collapsed = question.get('collapsed');
      question.set('collapsed', !collapsed);
      this.set('pendingRecursive', 1);
      // Toggle children questions
      run.next(this, function() {
        this._collapseChild(question.get('child'), !collapsed);
      });
    },

    toggleQuestion(e) {
      let checked = e.target.checked;
      let question = this.get('question');
      let questionId = this.get('question.id');
      let otherQuetions = this.get('otherQuetions');
      this.get('toggleQuestion')(question, checked);
      // Toggle children questions
      otherQuetions.forEach(otherQuetion => {
        if (otherQuetion.get('ancestry')) {
          let ancestrires = otherQuetion.get('ancestry').split('/');
          if (ancestrires.includes(questionId)) {
            otherQuetion.set('ancestrySelected', checked);
            this.get('toggleQuestion')(otherQuetion, checked);
          }
        }
      });
    }
  }
});
