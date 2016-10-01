import Ember from 'ember';

const { run } = Ember;

export default Ember.Route.extend({
  setupController(controller, model) {
    this._super(controller, model);
    // Progress bar indicators
    let i = 0,
        p = 0,
        surveyTemplate = model,
        total = surveyTemplate.get('questions.length');
    if(total === 0){
      controller.set('isLoadingQuestions', false);
    }else{
      surveyTemplate.hasMany('questions').ids().forEach((questionId) => {
        this.store.findRecord('question', questionId).then(function() {
          let pp = p;
          i += 1;
          p = (((i * 10 / total) - ((i * 10 / total) %0.5)));
          if(pp !== p){
            controller.set('loadingProgress', ((p * 10) + 5));
          }
          if((i+1) === total){
            run.next(this, function() {
              controller.set('isLoadingQuestions', false);
            });
          }
        });
      });
    }
  },
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
