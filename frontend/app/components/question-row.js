import Ember from 'ember';
const {
  computed: { alias }
} = Ember;

export default Ember.Component.extend({
  isFullyEditable: alias('question.surveyStep.surveyTemplate.fullyEditable'),
  attributeBindings: ['question.id:data-question-id'],

  actions: {
    confirm(){
      let el = this.get('element'),
          $confirm = Ember.$('.delete-confirm', el);
      $confirm.fadeIn();
    },
    cancel(){
      let el = this.get('element'),
          $confirm = Ember.$('.delete-confirm', el);
      $confirm.fadeOut();
    },
    delete(){
      let question = this.get('question'),
          el = this.get('element'),
          $confirm = Ember.$('.delete-confirm', el);
      question.deleteRecord();
      question.save().then(()=>{
        $confirm.fadeOut();
      });
      // Missing update question indexes
    }
  }

});
