import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['tag-row'],

  click() {
    let checkbox = this.element.querySelector('input');
    let addedTags = this.get('addedTags');
    let removedTags = this.get('removedTags');
    let tag = this.get('tag');
    let initialTagLists = this.get('initialTagLists');

    // The checkbox was unchecked before the click
    if (!checkbox.checked) {
      removedTags.removeObject(tag);
      // Some questions BUT not all has this tag initially
      if (this._inSome(initialTagLists) && !this._inAll(initialTagLists) && !checkbox.indeterminate) {
        checkbox.indeterminate = true;
        checkbox.checked = false;
        return;
      } else if (!this._inAll(initialTagLists)) {
        addedTags.addObject(tag);
      }
    } else if (checkbox.checked) {
      addedTags.removeObject(tag);
      if (this._inSome(initialTagLists)) {
        removedTags.addObject(tag);
      }
    }
    checkbox.indeterminate = false;
    checkbox.checked = !checkbox.checked;
  },

  didInsertElement() {
    this._super(...arguments);
    this._paintInitialState();
  },

  initialTagLists: computed('selectedQuestions.@each.tagList', function() {
    return this.get('selectedQuestions').map((question) => question.get('tagList').split(','));
  }),

  _paintInitialState() {
    let checkbox = this.element.querySelector('input');
    let addedTags = this.get('addedTags');
    let removedTags = this.get('removedTags');
    let tagLists = this.get('selectedQuestions').map((question) => {
      let list = question.get('tagList').split(',');
      list = [...new Set([...list, ...addedTags])]; // Union ∪
      return list.filter((tag) => !removedTags.includes(tag));
    });

    if (this._inAll(tagLists)) {
      checkbox.checked = true;
      checkbox.indeterminate = false;
    } else if (this._inSome(tagLists)) {
      checkbox.indeterminate = true;
      checkbox.checked = false;
    } else {
      checkbox.checked = checkbox.indeterminate = false;
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
