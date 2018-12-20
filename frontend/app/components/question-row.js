import $ from 'jquery';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { or } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  collapsible: service(),
  attributeBindings: ['question.id:data-question-id'],

  isPreviewing: false,
  isPreviewable: or('question.isTaxonType', 'question.answerType.hasAnswerChoices'),

  isSelected: computed('selectedQuestions.[]', 'question.id', function() {
    let selectedQuestions = this.get('selectedQuestions');
    let questionId = this.get('question.id');
    return selectedQuestions.some((question) => question.get('id') === questionId);
  }),

  typeInitial: computed('question.{ancestry,hidden,required,visibilityRule.isNew}', function() {
    let question = this.get('question');
    let intial = '';
    if (question.get('hidden')) {
      intial += '<span class="label label-default">Hidden</span>';
    }
    if (question.get('required')) {
      intial += '<span class="label label-danger">Required</span>';
    }
    if (question.get('visibilityRule') && !question.get('visibilityRule.isNew')) {
      intial += `<span class="label label-info">Rules</span>`;
    }
    return htmlSafe(intial);
  }),

  totalChildren: computed('otherQuetions.@each.ancestry', 'question.id', function() {
    let questionId = this.get('question.id');
    return this.get('otherQuetions').filter((question) => question.get('ancestry') === questionId).length;
  }),

  actions: {
    highlightConditional(questionId) {
      let question = this.get('store').peekRecord('question', questionId);
      question.set('highlighted', true);
    },

    unHighlightConditional(questionId) {
      let question = this.get('store').peekRecord('question', questionId);
      question.set('highlighted', false);
    },

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
      this.get('collapsible').toggleCollapsed(this.get('question'));
    },

    toggleQuestion(e) {
      let checked = e.target.checked;
      let question = this.get('question');
      let questionId = this.get('question.id');
      let otherQuetions = this.get('otherQuetions');
      this.get('toggleQuestion')(question, checked);
      // Toggle children questions
      otherQuetions.forEach((otherQuetion) => {
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
