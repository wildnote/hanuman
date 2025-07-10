import Component from '@ember/component';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: 'ul',
  classNames: ['sortable', 'ui-sortable'],
  
  // Properties
  items: [],
  onChange: null,
  
  // Internal state
  selectedItem: null,
  selectedIndex: -1,
  
  actions: {
    selectItem(item, index) {
      console.log('[CUSTOM DRAG] Select item:', item.get('questionText'), 'at index:', index);
      
      if (this.get('selectedItem') === item) {
        // Deselect if clicking the same item
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
      } else {
        // Select new item
        this.set('selectedItem', item);
        this.set('selectedIndex', index);
        this.createDropZones();
      }
    },
    
    moveToPosition(targetIndex) {
      const selectedIndex = this.get('selectedIndex');
      const selectedItem = this.get('selectedItem');
      
      if (!selectedItem || selectedIndex === targetIndex) {
        return;
      }
      
      console.log('[CUSTOM DRAG] Move item from', selectedIndex, 'to', targetIndex);
      
      const items = this.get('items').slice();
      const draggedItem = items.splice(selectedIndex, 1)[0];
      items.splice(targetIndex, 0, draggedItem);
      
      // Call the onChange callback
      if (typeof this.get('onChange') === 'function') {
        run(() => {
          this.get('onChange')(items, draggedItem);
        });
      }
      
      // Clear selection
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    }
  },
  
  createDropZones() {
    run.scheduleOnce('afterRender', this, () => {
      const items = this.element.querySelectorAll('.sortable-item');
      console.log('[CUSTOM DRAG] Creating drop zones for', items.length, 'items');
      
      items.forEach((element, index) => {
        if (index !== this.get('selectedIndex')) {
          element.classList.add('drop-zone-active');
          
          // Add click handler for drop
          const clickHandler = () => this.send('moveToPosition', index);
          element._dropClickHandler = clickHandler;
          element.addEventListener('click', clickHandler);
          
          // Add mouse enter/leave for visual feedback
          const enterHandler = () => this.highlightDropZone(element);
          const leaveHandler = () => this.unhighlightDropZone(element);
          element._dropEnterHandler = enterHandler;
          element._dropLeaveHandler = leaveHandler;
          element.addEventListener('mouseenter', enterHandler);
          element.addEventListener('mouseleave', leaveHandler);
        }
      });
    });
  },
  
  removeDropZones() {
    const items = this.element.querySelectorAll('.sortable-item');
    console.log('[CUSTOM DRAG] Removing drop zones');
    
    items.forEach(element => {
      element.classList.remove('drop-zone-active', 'drop-zone-highlighted');
      
      // Remove event listeners
      if (element._dropClickHandler) {
        element.removeEventListener('click', element._dropClickHandler);
        delete element._dropClickHandler;
      }
      if (element._dropEnterHandler) {
        element.removeEventListener('mouseenter', element._dropEnterHandler);
        delete element._dropEnterHandler;
      }
      if (element._dropLeaveHandler) {
        element.removeEventListener('mouseleave', element._dropLeaveHandler);
        delete element._dropLeaveHandler;
      }
    });
  },
  
  highlightDropZone(element) {
    element.classList.add('drop-zone-highlighted');
  },
  
  unhighlightDropZone(element) {
    element.classList.remove('drop-zone-highlighted');
  }
}); 