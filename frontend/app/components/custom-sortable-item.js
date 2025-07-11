import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'li',
  classNames: ['li-question', 'row', 'question-border', 'item', 'sortable-item'],
  classNameBindings: ['isSelected:selected', 'isContainerSelected:container-selected'],
  attributeBindings: ['indentationStyle:style'],

  // Properties
  model: null,
  index: 0,
  onSelect: null,
  selectedItem: null,
  selectedIndex: -1,

  // Computed properties
  isSelected: computed('model', 'index', 'selectedItem', 'selectedIndex', function() {
    return this.get('selectedItem') === this.get('model') || this.get('selectedIndex') === this.get('index');
  }),

  isContainer: computed('model', function() {
    const model = this.get('model');
    return model && (model.get('isARepeater') || model.get('isContainer'));
  }),

  isContainerSelected: computed('isSelected', 'isContainer', function() {
    return this.get('isSelected') && this.get('isContainer');
  }),

  // Calculate indentation level based on ancestry
  indentationLevel: computed('model.{parentId,ancestry}', function() {
    const model = this.get('model');

    if (!model) {
      return 0;
    }

    const parentId = model.get('parentId');
    const ancestry = model.get('ancestry');

    // Only indent questions that have a parent (are nested)
    if (parentId) {
      // This question has a parent, so it should be indented
      if (ancestry) {
        const ancestryLevels = ancestry.split('/').length;
        return ancestryLevels;
      } else {
        return 1; // If there's a parentId but no ancestry, it's at least level 1
      }
    }

    // No parentId means this is a top-level question - no indentation
    return 0;
  }),

  // Generate indentation style for the entire row
  indentationStyle: computed('indentationLevel', function() {
    const level = this.get('indentationLevel');
    const indentPixels = level * 20; // 20px per level
    return `margin-left: ${indentPixels}px;`;
  }),

  didInsertElement() {
    this._super(...arguments);

    // The custom-sortable-group component now handles move icon clicks
    // No need for additional click handlers here
  }
});
