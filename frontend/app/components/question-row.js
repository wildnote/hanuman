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
    const selectedQuestions = this.get('selectedQuestions');
    const questionId = this.get('question.id');
    return selectedQuestions.some((question) => question.get('id') === questionId);
  }),

  typeInitial: computed(
    'question.{ancestry,hidden,required,visibilityRule.isNew,displayDataInRepeaterHeader,defaultAnswer}',
    function() {
      const question = this.get('question');
      let initial = '';
      if (question.get('hidden')) {
        initial += '<span class="label label-default">Hidden</span>';
      }
      if (question.get('required')) {
        initial += '<span class="label label-danger">Required</span>';
      }
      if (question.get('visibilityRule') && !question.get('visibilityRule.isNew')) {
        initial += '<span class="label label-info">Rules</span>';
      }
      if (question.get('calculationRule') || question.get('calculated')) {
        initial += '<span class="label label-success">Calculated</span>';
      }
      if (question.get('displayDataInRepeaterHeader')) {
        initial += '<span class="label label-default">Display</span>';
      }
      if (question.get('defaultAnswer')) {
        initial += '<span class="label label-default">Default</span>';
      }
      return htmlSafe(initial);
    }
  ),

  totalChildren: computed('otherQuetions.@each.ancestry', 'question.id', function() {
    const questionId = this.get('question.id');
    return this.get('otherQuetions').filter((question) => question.get('ancestry') === questionId).length;
  }),

  actions: {
    highlightConditional(questionId) {
      const question = this.get('store').peekRecord('question', questionId);
      question.set('highlighted', true);
    },

    unHighlightConditional(questionId) {
      const question = this.get('store').peekRecord('question', questionId);
      question.set('highlighted', false);
    },

    confirm() {
      const confirmEl = this.element.querySelector('.delete-confirm');
      if (confirmEl) {
        confirmEl.style.display = 'block';
      }
    },

    cancel() {
      const confirmEl = this.element.querySelector('.delete-confirm');
      if (confirmEl) {
        confirmEl.style.display = 'none';
      }
    },

    delete() {
      const question = this.get('question');
      const el = this.get('element');
      this.sendAction('deleteQuestion', question, el);
    },

    toggleCollapsed() {
      this.get('collapsible').toggleCollapsed(this.get('question'));
    },

    toggleQuestion(e) {
      const checked = e.target.checked;
      const question = this.get('question');
      const questionId = this.get('question.id');
      const otherQuetions = this.get('otherQuetions');
      this.get('toggleQuestion')(question, checked);
      // Toggle children questions
      otherQuetions.forEach((otherQuetion) => {
        if (otherQuetion.get('ancestry')) {
          const ancestrires = otherQuetion.get('ancestry').split('/');
          if (ancestrires.includes(questionId)) {
            otherQuetion.set('ancestrySelected', checked);
            this.get('toggleQuestion')(otherQuetion, checked);
          }
        }
      });
    }
  }
});
