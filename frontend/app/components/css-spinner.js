import Component from '@ember/component';

export default Component.extend({
  classNames: ['css-spinner'],

  // Optional properties that can be passed in
  size: 40,
  color: '#3498db',

  didInsertElement() {
    this._super(...arguments);

    // Apply custom size and color if provided
    if (this.size) {
      this.element.style.setProperty('--spinner-size', `${this.size}px`);
    }

    if (this.color) {
      this.element.style.setProperty('--spinner-color', this.color);
    }
  }
});
