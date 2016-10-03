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
      let ancestryQuestion = opts.target.acenstry;
      question.set('parentId',ancestryQuestion.get('id'));
      question.set('sortOrder',ancestryQuestion.get('sortOrder'));
      question.save().then(()=>{
        question.reload();
      });
      this.sendAction('updateSortOrder',this.get('sortedQuestions'));
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
