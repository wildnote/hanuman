import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  attributeBindings: ['question.id:data-question-id'],

  typeInitial: computed('question.{ancestry,hidden,required}', function() {
    const question = this.get('question');
    let intial = '';
    if (question.get('hidden')) { intial += '<span class="label label-default">Hidden</span>'; }
    if (question.get('required')) { intial += '<span class="label label-danger">Required</span>'; }
    if (question.get('rule')) { intial += `<span class="label label-info">Rules</span>`; }
    return Ember.String.htmlSafe(intial);
  }),

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
          el = this.get('element');
      this.sendAction('deleteQuestion',question, el);
    }
  }
});
