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
    const isContainer = model && (model.get('isARepeater') || model.get('isContainer'));
    console.log('[CUSTOM ITEM] Container check for', model ? model.get('questionText') : 'no model', 'isContainer:', isContainer);
    return isContainer;
  }),

  isContainerSelected: computed('isSelected', 'isContainer', function() {
    const isContainerSelected = this.get('isSelected') && this.get('isContainer');
    console.log('[CUSTOM ITEM] Container selected check - isSelected:', this.get('isSelected'), 'isContainer:', this.get('isContainer'), 'result:', isContainerSelected);
    return isContainerSelected;
  }),

  // Calculate indentation level based on ancestry
  indentationLevel: computed('model.{parentId,ancestry}', function() {
    const model = this.get('model');
    
    if (!model) {
      return 0;
    }
    
    // Only indent questions that have a parent (are nested)
    const parentId = model.get('parentId');
    if (parentId) {
      // This question has a parent, so it should be indented
      const ancestry = model.get('ancestry');
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
    const style = `margin-left: ${indentPixels}px;`;
    console.log('[CUSTOM ITEM] Indentation style:', style, 'for level:', level);
    return style;
  }),
  
  didInsertElement() {
    this._super(...arguments);
    
    // Add click handler to the drag handle
    const dragHandle = this.element.querySelector('.glyphicons-sorting');
    if (dragHandle) {
      dragHandle.addEventListener('click', this.handleClick.bind(this));
    }
  },
  
  willDestroyElement() {
    this._super(...arguments);
    
    // Remove click handler
    const dragHandle = this.element.querySelector('.glyphicons-sorting');
    if (dragHandle) {
      dragHandle.removeEventListener('click', this.handleClick.bind(this));
    }
  },
  
  handleClick(event) {
    console.log('[CUSTOM ITEM] Handle clicked for item:', this.get('model.questionText'));
    
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    if (typeof this.get('onSelect') === 'function') {
      this.get('onSelect')(this.get('model'), this.get('index'));
    }
  }
}); 