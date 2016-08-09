import Ember from 'ember';

export default Ember.Route.extend({
  actions:{
    reorderQuestions(questions){
      this.send('updateSortOrder',questions);
    },
    updateSortOrder(questions){
      questions.forEach(function(question, index) {
        question.set('sortOrder', index + 1);
        question.save();
      });
    },
    deleteQuestion(question, elRow){
      let $confirm = Ember.$('.delete-confirm', elRow),
          questionId = question.get('id');
      question.deleteRecord();
      question.save().then(()=>{
        let childrenQuestions = this.currentModel.get('questions').filterBy('ancestry',questionId.toString());
        for (var childQuestion of childrenQuestions) {
          childQuestion.deleteRecord();
        }
        $confirm.fadeOut();
      });
    }
  }
});
