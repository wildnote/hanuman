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
  isSettingAncestry: false,
  
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

    clearSelection() {
      console.log('[CUSTOM DRAG] Clearing selection');
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    },

    moveToContainer(containerIndex) {
      console.log('[CUSTOM DRAG] moveToContainer called with index:', containerIndex);
      
      const selectedItem = this.get('selectedItem');
      
      if (!selectedItem) {
        console.log('[CUSTOM DRAG] No selected item found');
        return;
      }
      
      const items = this.get('items');
      const containerQuestion = items[containerIndex];
      
      if (!containerQuestion) {
        console.log('[CUSTOM DRAG] No container question found at index:', containerIndex);
        return;
      }
      
      console.log('[CUSTOM DRAG] Container drop zone clicked for container:', containerQuestion.get('questionText'));
      
      // Show prompt to user
      const containerName = containerQuestion.get('questionText');
      const questionName = selectedItem.get('questionText');
      
      console.log('[CUSTOM DRAG] Showing prompt for:', questionName, 'and container:', containerName);
      
      const choice = confirm(`Where would you like to place "${questionName}"?\n\nClick OK to place it INSIDE "${containerName}"\nClick Cancel to place it AFTER "${containerName}"`);
      
      console.log('[CUSTOM DRAG] User choice:', choice ? 'INSIDE' : 'AFTER');
      
      if (choice) {
        // User chose to place it INSIDE the container
        console.log('[CUSTOM DRAG] Moving', questionName, 'INSIDE', containerName);
        
        // Use the parent's setAncestryTask to properly handle ancestry
        const parentComponent = this.get('parentView');
        if (parentComponent && parentComponent.get('setAncestryTask')) {
          console.log('[CUSTOM DRAG] Using parent setAncestryTask');
          parentComponent.get('setAncestryTask').perform(selectedItem, { target: { acenstry: containerQuestion } });
        } else {
          console.log('[CUSTOM DRAG] Parent setAncestryTask not available, falling back to manual ancestry');
          
          // Set flag to prevent moveToPosition from interfering
          this.set('isSettingAncestry', true);
          
          // Set the ancestry relationship
          const oldParentId = selectedItem.get('parentId');
          console.log('[CUSTOM DRAG] Old parentId:', oldParentId, 'New parentId:', containerQuestion.get('id'));
          
          selectedItem.set('parentId', containerQuestion.get('id'));
          
          // Save the question to persist the ancestry change
          selectedItem.save().then(() => {
            console.log('[CUSTOM DRAG] Question ancestry updated successfully');
            console.log('[CUSTOM DRAG] Question parentId after save:', selectedItem.get('parentId'));
            
            // Don't call onChange for ancestry changes - let the parent handle the re-render
            // The ancestry change will be reflected when the parent re-fetches the data
            console.log('[CUSTOM DRAG] Ancestry set successfully, not calling onChange to avoid sort override');
            
            // Clear the ancestry flag
            this.set('isSettingAncestry', false);
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error updating ancestry:', error);
            this.set('isSettingAncestry', false);
          });
        }
      } else {
        // User chose to place it AFTER the container (normal positioning)
        console.log('[CUSTOM DRAG] Moving', questionName, 'AFTER', containerName);
        this.send('moveToPosition', containerIndex + 1);
        return; // Don't clear selection yet, let moveToPosition handle it
      }
      
      // Clear selection
      console.log('[CUSTOM DRAG] Clearing selection after container action');
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    },

    moveToPosition(targetIndex) {
      // Don't run if we're setting ancestry
      if (this.get('isSettingAncestry')) {
        console.log('[CUSTOM DRAG] Skipping moveToPosition because ancestry is being set');
        return;
      }
      
      const selectedIndex = this.get('selectedIndex');
      const selectedItem = this.get('selectedItem');
      
      if (!selectedItem || selectedIndex === targetIndex) {
        return;
      }
      
      console.log('[CUSTOM DRAG] Move item from', selectedIndex, 'to', targetIndex);
      
      const items = this.get('items').slice();
      const draggedItem = items.splice(selectedIndex, 1)[0];
      items.splice(targetIndex, 0, draggedItem);
      
      // Check if the target position is inside a container
      const targetQuestion = items[targetIndex];
      if (targetQuestion && (targetQuestion.get('isARepeater') || targetQuestion.get('isContainer'))) {
        console.log('[CUSTOM DRAG] Moving item into container:', targetQuestion.get('questionText'));
        
        // Set the ancestry relationship
        draggedItem.set('parentId', targetQuestion.get('id'));
        
        // Save the question to persist the ancestry change
        draggedItem.save().then(() => {
          console.log('[CUSTOM DRAG] Question ancestry updated successfully');
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error updating ancestry:', error);
        });
      } else {
        // Check if we're moving out of a container (setting parentId to null)
        const currentParentId = draggedItem.get('parentId');
        if (currentParentId) {
          console.log('[CUSTOM DRAG] Moving item out of container');
          draggedItem.set('parentId', null);
          
          // Save the question to persist the ancestry change
          draggedItem.save().then(() => {
            console.log('[CUSTOM DRAG] Question ancestry cleared successfully');
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
          });
        }
      }
      
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
        // Don't create drop zones for the selected item
        if (index !== this.get('selectedIndex')) {
          // Check if this is a container
          const questionElement = element.querySelector('[data-question-id]');
          let isContainer = false;
          let question = null;
          
          if (questionElement) {
            const questionId = questionElement.getAttribute('data-question-id');
            question = this.get('items').findBy('id', questionId);
            if (question && (question.get('isARepeater') || question.get('isContainer'))) {
              isContainer = true;
            }
          }
          
          if (isContainer) {
            // Add green drop zone for containers (ancestry functionality)
            element.classList.add('container-drop-zone-active');
            
            // Remove any existing handlers first
            if (element._containerDropClickHandler) {
              element.removeEventListener('click', element._containerDropClickHandler);
            }
            
            // Add click handler for container drop
            const clickHandler = (event) => {
              console.log('[CUSTOM DRAG] Container drop zone clicked for index:', index, 'question:', question ? question.get('questionText') : 'unknown');
              
              // Prevent event bubbling
              event.preventDefault();
              event.stopPropagation();
              
              this.send('moveToContainer', index);
            };
            element._containerDropClickHandler = clickHandler;
            element.addEventListener('click', clickHandler);
            
            // Add mouse enter/leave for visual feedback
            const enterHandler = () => this.highlightContainerDropZone(element);
            const leaveHandler = () => this.unhighlightContainerDropZone(element);
            element._containerDropEnterHandler = enterHandler;
            element._containerDropLeaveHandler = leaveHandler;
            element.addEventListener('mouseenter', enterHandler);
            element.addEventListener('mouseleave', leaveHandler);
            
            console.log('[CUSTOM DRAG] Added green drop zone for container at index:', index, 'question:', question ? question.get('questionText') : 'unknown');
          } else {
            // Add blue drop zone for regular positioning
            element.classList.add('drop-zone-active');
            
            // Remove any existing handlers first
            if (element._dropClickHandler) {
              element.removeEventListener('click', element._dropClickHandler);
            }
            
            // Add click handler for drop
            const clickHandler = (event) => {
              console.log('[CUSTOM DRAG] Drop zone clicked for index:', index);
              
              // Prevent event bubbling
              event.preventDefault();
              event.stopPropagation();
              
              this.send('moveToPosition', index);
            };
            element._dropClickHandler = clickHandler;
            element.addEventListener('click', clickHandler);
            
            // Add mouse enter/leave for visual feedback
            const enterHandler = () => this.highlightDropZone(element);
            const leaveHandler = () => this.unhighlightDropZone(element);
            element._dropEnterHandler = enterHandler;
            element._dropLeaveHandler = leaveHandler;
            element.addEventListener('mouseenter', enterHandler);
            element.addEventListener('mouseleave', leaveHandler);
            
            console.log('[CUSTOM DRAG] Added blue drop zone for regular positioning at index:', index);
          }
        }
      });
    });
  },
  
  removeDropZones() {
    const items = this.element.querySelectorAll('.sortable-item');
    console.log('[CUSTOM DRAG] Removing drop zones');
    
    items.forEach(element => {
      element.classList.remove('drop-zone-active', 'drop-zone-highlighted', 'container-drop-zone-active', 'container-drop-zone-highlighted');
      
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
      if (element._containerDropClickHandler) {
        element.removeEventListener('click', element._containerDropClickHandler);
        delete element._containerDropClickHandler;
      }
      if (element._containerDropEnterHandler) {
        element.removeEventListener('mouseenter', element._containerDropEnterHandler);
        delete element._containerDropEnterHandler;
      }
      if (element._containerDropLeaveHandler) {
        element.removeEventListener('mouseleave', element._containerDropLeaveHandler);
        delete element._containerDropLeaveHandler;
      }
    });
  },
  
  highlightDropZone(element) {
    element.classList.add('drop-zone-highlighted');
  },
  
  unhighlightDropZone(element) {
    element.classList.remove('drop-zone-highlighted');
  },

  highlightContainerDropZone(element) {
    element.classList.add('container-drop-zone-highlighted');
  },

  unhighlightContainerDropZone(element) {
    element.classList.remove('container-drop-zone-highlighted');
  }
}); 