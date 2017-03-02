import Ember from 'ember';
const {
  run,
  computed: { sort, alias },
  $
} = Ember;

export default Ember.Component.extend({
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('surveyTemplate.filteredquestions', 'questionsSorting'),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  actions:{
    deleteQuestion(question, elRow){
      let $confirm = Ember.$('.delete-confirm', elRow),
          questionId = question.get('id');
      question.deleteRecord();
      question.save().then(()=>{
        let childrenQuestions = this.get('surveyTemplate.questions').filterBy('ancestry',questionId.toString());
        for (var childQuestion of childrenQuestions) {
          childQuestion.deleteRecord();
        }
        $confirm.fadeOut();
      });
    },
    setAncestry(question, opts){
      let ancestryQuestion = opts.target.acenstry,
          parentId = ancestryQuestion.get('id'),
          lastChildren = this.get('surveyTemplate.questions').filterBy('parentId',parentId).get('lastObject'),
          sortOrder = lastChildren ? lastChildren.get('sortOrder') : ancestryQuestion.get('sortOrder');

      sortOrder++;

      question.set('loading', true);
      question.set('parentId', parentId);
      question.set('sortOrder', sortOrder);
      question.save().then(() => {
        question.reload();
        run.later(this ,()=> {
          this.sendAction('updateSortOrder',this.get('sortedQuestions'));
          question.set('loading', false);
        }, 1000);
      });
    },
    dragStarted(question){
      $('.draggable-object-target').parent(`:not(.model-id-${question.get('parentId')})`).addClass('dragging-coming-active');
    },
    dragEnded(){
      $('.draggable-object-target').parent().removeClass('dragging-coming-active');
    },
    dragOver(){
      run.next(this, function() {
        $('.accepts-drag').parent().addClass('dragging-over');
      });
    },
    dragOut(){
      $('.draggable-object-target').parent().removeClass('dragging-over');
    }
  }
});
