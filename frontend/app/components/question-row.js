import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  attributeBindings: ['question.id:data-question-id'],

  typeInitial: computed('question.{ancestry,hidden,required}', function() {
    const question = this.get('question');
    let intial = '';
    if (question.get('ancestry')) { intial += `<span class="label label-default">Ancestry (${question.get('ancestry')})</span>`; }
    if (question.get('hidden')) { intial += '<span class="label label-info">Hidden</span>'; }
    if (question.get('required')) { intial += '<span class="label label-danger">Required</span>'; }
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
