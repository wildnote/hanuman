import SortableGroup from 'ember-sortable/components/sortable-group';
import { run } from '@ember/runloop';

export default SortableGroup.extend({
  // Override the commit method that calls sendAction
  commit() {
    console.log('[DRAG GROUP] commit called');
    console.log('[DRAG GROUP] items in group:', this.get('items').map(item => item.get('model.questionText')));
    console.log('[DRAG GROUP] sortedItems:', this.get('sortedItems') ? this.get('sortedItems').map(item => item.get('model.questionText')) : []);
    console.log('[DRAG GROUP] group element:', this.element);
    console.log('[DRAG GROUP] group children:', this.element ? this.element.children : 'no element');
    
    // Temporarily override sendAction to prevent deprecation warnings
    const originalSendAction = this.sendAction;
    this.sendAction = () => {};
    
    // Call parent method
    this._super(...arguments);
    
    // Restore original sendAction
    this.sendAction = originalSendAction;
    
    // Call closure action if provided
    if (typeof this.get('onChange') === 'function') {
      run(() => {
        const items = this.get('sortedItems') || [];
        const itemModels = items.map(item => item.model);
        const draggedItem = items.find(item => item.wasDropped);
        let draggedModel = draggedItem ? draggedItem.model : undefined;
        
        console.log('[DRAG GROUP] Calling onChange with:', {
          itemModels: itemModels.map(q => [q.get('id'), q.get('questionText')]),
          draggedModel: draggedModel ? [draggedModel.get('id'), draggedModel.get('questionText')] : null
        });
        
        // Pass the arguments in the order expected by the sortedDropped method
        this.get('onChange')(itemModels, draggedModel);
      });
    }
  },

  _tellGroup() {
    console.log('[DRAG GROUP] _tellGroup called');
    console.log('[DRAG GROUP] _tellGroup arguments:', arguments);
    this._super(...arguments);
  },

  _createDropZones() {
    console.log('[DRAG GROUP] _createDropZones called');
    this._super(...arguments);
  },

  _removeDropZones() {
    console.log('[DRAG GROUP] _removeDropZones called');
    this._super(...arguments);
  }
}); 