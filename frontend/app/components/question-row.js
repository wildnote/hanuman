import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

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
      if (!question) {
        return htmlSafe('');
      }

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
  ).readOnly(),

  totalChildren: computed('otherQuetions.@each.ancestry', 'question.id', function() {
    const questionId = this.get('question.id');
    return this.get('otherQuetions').filter((question) => question.get('ancestry') === questionId).length;
  }),

  // Calculate indentation level based on ancestry
  indentationLevel: computed('question.{parentId,ancestry}', function() {
    const question = this.get('question');

    if (!question) {
      console.log('[INDENT] No question, returning 0');
      return 0;
    }

    // Debug: log all available properties
    console.log('[INDENT] Question properties:', {
      id: question.get('id'),
      questionText: question.get('questionText'),
      parentId: question.get('parentId'),
      ancestry: question.get('ancestry'),
      childIds: question.get('childIds'),
      sortOrder: question.get('sortOrder'),
      isARepeater: question.get('isARepeater'),
      isContainer: question.get('isContainer'),
      childQuestion: question.get('childQuestion'),
      numChildren: question.get('numChildren')
    });

    // Try using the existing numChildren computed property first
    const numChildren = question.get('numChildren');
    if (numChildren > 0) {
      console.log('[INDENT] Using numChildren system - numChildren:', numChildren);
      return numChildren;
    }

    // Try using the existing ancestry system
    const ancestry = question.get('ancestry');
    if (ancestry) {
      const ancestryLevels = ancestry.split('/').length;
      console.log('[INDENT] Using ancestry system - ancestry:', ancestry, 'levels:', ancestryLevels);
      return ancestryLevels;
    }

    // Fallback to parentId system
    const parentId = question.get('parentId');
    if (parentId) {
      console.log('[INDENT] Using parentId system - parentId:', parentId);
      return 1; // If there's a parentId, it's at least level 1
    }

    console.log('[INDENT] No hierarchy found, returning 0');
    return 0;
  }),

  // Generate indentation style for the question text
  indentationStyle: computed('indentationLevel', function() {
    const level = this.get('indentationLevel');
    const indentPixels = level * 20; // 20px per level
    const style = `margin-left: ${indentPixels}px;`;
    console.log('[INDENT] Generated style:', style, 'for level:', level);
    return htmlSafe(style);
  }),

  actions: {
    highlightConditional(questionId) {
      const question = this.get('store').peekRecord('question', questionId);
      if (question) {
        run.scheduleOnce('actions', this, () => {
          question.set('highlighted', true);
        });
      }
    },

    unHighlightConditional(questionId) {
      const question = this.get('store').peekRecord('question', questionId);
      if (question) {
        run.scheduleOnce('actions', this, () => {
          question.set('highlighted', false);
        });
      }
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
      if (this.get('deleteQuestion')) {
        this.get('deleteQuestion')(question, el);
      }
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
            run.scheduleOnce('actions', this, () => {
              otherQuetion.set('ancestrySelected', checked);
              this.get('toggleQuestion')(otherQuetion, checked);
            });
          }
        }
      });
    },


  }
});
