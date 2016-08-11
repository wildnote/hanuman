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
    }
  }
});
