import Component from '@ember/component';
import { run } from '@ember/runloop';
import { alias, sort } from '@ember/object/computed';
import $ from 'jquery';

export default Component.extend({
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('surveyTemplate.filteredquestions', 'questionsSorting'),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  actions: {
    deleteQuestion(question, elRow) {
      let $confirm = $('.delete-confirm', elRow);
      let questionId = question.get('id');
      question.deleteRecord();
      question.save().then(() => {
        let childrenQuestions = this.get('surveyTemplate.questions').filterBy('ancestry', questionId.toString());
        for (let childQuestion of childrenQuestions) {
          childQuestion.deleteRecord();
        }
        $confirm.fadeOut();
      });
    },
    setAncestry(question, opts) {
      let ancestryQuestion = opts.target.acenstry;
      let parentId = ancestryQuestion.get('id');
      let parentChildren = this.get('surveyTemplate.questions').filterBy('parentId', parentId).sortBy('sortOrder');
      let lastChild = parentChildren.get('lastObject');
      let sortOrder = lastChild ? lastChild.get('sortOrder') : ancestryQuestion.get('sortOrder');

      question.set('loading', true);
      question.set('parentId', parentId);
      question.set('sortOrder', sortOrder);
      question.save().then(() => {
        question.reload();
        run.later(this, ()=> {
          this.sendAction('updateSortOrder', this.get('sortedQuestions'));
          question.set('loading', false);
        }, 1000);
      });
    },
    dragStarted(question) {
      $('.draggable-object-target').parent(`:not(.model-id-${question.get('parentId')})`).addClass('dragging-coming-active');
    },
    dragEnded() {
      $('.draggable-object-target').parent().removeClass('dragging-coming-active');
    },
    dragOver() {
      run.next(this, function() {
        $('.accepts-drag').parent().addClass('dragging-over');
      });
    },
    dragOut() {
      $('.draggable-object-target').parent().removeClass('dragging-over');
    }
  }
});
