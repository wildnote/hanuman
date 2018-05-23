import Component from '@ember/component';

export default Component.extend({
  classNames: ['tag-row'],

  didInsertElement() {
    this._super(...arguments);
    this._resolveState();
  },

  _resolveState() {
    let checkbox = this.element.querySelector('input');
    let tagLists = this.get('selectedQuestions').map((question) => question.get('tagList').split(','));
    if (this._inAll(tagLists)) {
      checkbox.checked = true;
    } else if (this._inSome(tagLists)) {
      checkbox.indeterminate = true;
    } else {
      checkbox.checked = false;
    }
  },

  _inAll(tagLists) {
    let tag = this.get('tag');
    return tagLists.every((list) => list.includes(tag));
  },

  _inSome(tagLists) {
    let tag = this.get('tag');
    return tagLists.some((list) => list.includes(tag));
  }
});
