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
  showPlacementOptions: false,
  placementQuestion: null,
  placementContainer: null,
  
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
      
      // Show placement options modal directly
      const questionName = selectedItem.get('questionText');
      const containerName = containerQuestion.get('questionText');
      console.log('[CUSTOM DRAG] Showing placement modal for:', questionName, 'and container:', containerName);
      
      this.send('showPlacementModal', selectedItem, containerQuestion);
    },

    showPlacementModal(question, container) {
      console.log('[CUSTOM DRAG] Showing placement modal for:', question.get('questionText'), 'and container:', container.get('questionText'));
      this.set('showPlacementOptions', true);
      this.set('placementQuestion', question);
      this.set('placementContainer', container);
    },

    hidePlacementModal() {
      this.set('showPlacementOptions', false);
      this.set('placementQuestion', null);
      this.set('placementContainer', null);
      
      // Clear selection
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    },

    placeInsideTop() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'INSIDE TOP of', container.get('questionText'));
      
      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);
      
      // Set the ancestry relationship
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Old parentId:', oldParentId, 'New parentId:', container.get('id'));
      
      question.set('parentId', container.get('id'));
      
      // Find existing children of the container to determine proper sort order for top placement
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('surveyTemplate')) {
        const surveyTemplate = parentComponent.get('surveyTemplate');
        const parentChildren = surveyTemplate.get('questions')
          .filterBy('parentId', container.get('id'))
          .sortBy('sortOrder');
        
        let newSortOrder;
        if (parentChildren.get('length') > 0) {
          // Place before the first child (at the top)
          const firstChild = parentChildren.get('firstObject');
          newSortOrder = firstChild.get('sortOrder') - 0.1;
          console.log('[CUSTOM DRAG] Found existing children, placing before first child at sortOrder:', newSortOrder);
        } else {
          // No existing children, place right after the container
          newSortOrder = container.get('sortOrder') + 0.1;
          console.log('[CUSTOM DRAG] No existing children, placing after container at sortOrder:', newSortOrder);
        }
        
        question.set('sortOrder', newSortOrder);
        
        // Save the question to persist the ancestry change
        question.save().then(() => {
          console.log('[CUSTOM DRAG] Question ancestry updated successfully for top placement');
          console.log('[CUSTOM DRAG] Question parentId after save:', question.get('parentId'));
          console.log('[CUSTOM DRAG] Question sortOrder after save:', question.get('sortOrder'));
          
          // Clear the ancestry flag
          this.set('isSettingAncestry', false);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error updating ancestry:', error);
          this.set('isSettingAncestry', false);
        });
      } else {
        console.error('[CUSTOM DRAG] Could not access surveyTemplate for sort order calculation');
        this.set('isSettingAncestry', false);
      }
      
      this.send('hidePlacementModal');
    },

    placeInsideBottom() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'INSIDE BOTTOM of', container.get('questionText'));
      
      // Use the parent's setAncestryTask to properly handle ancestry (places at bottom)
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('setAncestryTask')) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for inside bottom');
        parentComponent.get('setAncestryTask').perform(question, { target: { acenstry: container } });
      }
      
      this.send('hidePlacementModal');
    },

    placeAboveContainer() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'ABOVE', container.get('questionText'));
      
      // Find the container's index and place the question before it
      const containerIndex = this.get('items').indexOf(container);
      this.send('moveToPosition', containerIndex);
      
      this.send('hidePlacementModal');
    },

    placeBelowContainer() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'BELOW', container.get('questionText'));
      
      // Find the container's index and place the question after it
      const containerIndex = this.get('items').indexOf(container);
      this.send('moveToPosition', containerIndex + 1);
      
      this.send('hidePlacementModal');
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
      
      // Check if we're moving out of a container (setting parentId to null)
      const currentParentId = draggedItem.get('parentId');
      if (currentParentId) {
        console.log('[CUSTOM DRAG] Moving item out of container, clearing ancestry');
        draggedItem.set('parentId', null);
        
        // Save the question to persist the ancestry change
        draggedItem.save().then(() => {
          console.log('[CUSTOM DRAG] Question ancestry cleared successfully');
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        });
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