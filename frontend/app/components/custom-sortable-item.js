import Component from '@ember/component';

export default Component.extend({
  tagName: 'li',
  classNames: ['li-question', 'row', 'question-border', 'item', 'sortable-item'],
  
  // Properties
  model: null,
  index: 0,
  onSelect: null,
  
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