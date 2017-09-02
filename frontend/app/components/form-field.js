import Ember from 'ember';

export default Ember.Component.extend({
  addInputWrapper: true,
  tagName: 'div',
  classNames: 'form-field',
  classNameBindings: ['hasError:error', 'fieldClass', 'for'],

  object: Ember.computed.alias('parentView.for'),

  fieldClass: Ember.computed('group', {
    get() {
      let isGroup = this.get('group'),
        fieldClass =  isGroup ? 'fields' : 'field';

      return fieldClass;
    }
  }),

  hasError: Ember.computed('object.errors.[]', {
    get() {
      let _ref = this.get('object.errors');

      return _ref != null ? _ref.has(this.get('for')) : void 0;
    }
  }),

  errors: Ember.computed('object.errors.[]', {
    get() {
      if (!this.get('object.errors')) {
        return Ember.A();
      }

      return this.get('object.errors').errorsFor(this.get('for')).mapBy('message')[0];
    }
  })
});
