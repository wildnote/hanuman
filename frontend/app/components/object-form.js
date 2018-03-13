import Component from '@ember/component';

export default Component.extend({
  tagName: 'form',
  classNames: 'form-content object-form',
  attributeBindings: ['onsubmit'],

  submit(e) {
    e.preventDefault();
  },

  onsubmit(e) {
    e.preventDefault();
  }
});
