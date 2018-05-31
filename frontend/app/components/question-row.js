import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  attributeBindings: ['question.id:data-question-id'],

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
      let questionId = this.get('question.id');
      let otherQuetions = this.get('otherQuetions');

      question.set('collapsed', !collapsed);
      // Toggle children questions
      otherQuetions.forEach(otherQuetion => {
        if (otherQuetion.get('ancestry')) {
          let ancestrires = otherQuetion.get('ancestry').split('/');
          if (ancestrires.includes(questionId)) {
            otherQuetion.set('ancestryCollapsed', !collapsed);
          }
        }
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
            let ancestrySelected = otherQuetion.get('ancestrySelected');
            otherQuetion.set('ancestrySelected', !ancestrySelected);
            this.get('toggleQuestion')(otherQuetion, checked);
          }
        }
      });
    }
  }
});
