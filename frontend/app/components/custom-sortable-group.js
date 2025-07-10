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
      
      // Use the parent's setAncestryTask to properly handle ancestry (this will expand the container if needed)
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('setAncestryTask')) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for inside top');
        parentComponent.get('setAncestryTask').perform(question, { target: { acenstry: container } }).then(() => {
          // After ancestry is set, adjust the sort order to place at top
          const surveyTemplate = parentComponent.get('surveyTemplate');
          if (surveyTemplate) {
            const parentChildren = surveyTemplate.get('questions')
              .filterBy('parentId', container.get('id'))
              .sortBy('sortOrder');
            
            if (parentChildren.get('length') > 1) { // More than just the question we just added
              // Find the first child (excluding our question)
              const firstChild = parentChildren.reject(q => q.get('id') === question.get('id')).get('firstObject');
              if (firstChild) {
                // Place our question before the first child
                const newSortOrder = firstChild.get('sortOrder') - 0.1;
                console.log('[CUSTOM DRAG] Adjusting sort order to place at top:', newSortOrder);
                question.set('sortOrder', newSortOrder);
                question.save().then(() => {
                  // Refresh the UI
                  parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true);
                });
              }
            }
          }
          
          // Clear the ancestry flag
          this.set('isSettingAncestry', false);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error in setAncestryTask:', error);
          this.set('isSettingAncestry', false);
        });
      } else {
        console.error('[CUSTOM DRAG] Could not access parent setAncestryTask');
        this.set('isSettingAncestry', false);
      }
      
      this.send('hidePlacementModal');
    },

    placeInsideBottom() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'INSIDE BOTTOM of', container.get('questionText'));
      
      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);
      
      // Use the parent's setAncestryTask to properly handle ancestry (places at bottom)
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('setAncestryTask')) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for inside bottom');
        parentComponent.get('setAncestryTask').perform(question, { target: { acenstry: container } }).then(() => {
          // Clear the ancestry flag after the task completes
          this.set('isSettingAncestry', false);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error in setAncestryTask:', error);
          this.set('isSettingAncestry', false);
        });
      } else {
        console.error('[CUSTOM DRAG] Could not access parent setAncestryTask');
        this.set('isSettingAncestry', false);
      }
      
      this.send('hidePlacementModal');
    },

    placeAboveContainer() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'ABOVE', container.get('questionText'));
      
      // Calculate target position BEFORE clearing ancestry
      const containerIndex = this.get('items').indexOf(container);
      const targetIndex = containerIndex;
      console.log('[CUSTOM DRAG] Target position calculated:', targetIndex, 'for container at index:', containerIndex);
      
      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);
      
      // Clear ancestry and save
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Clearing ancestry from parentId:', oldParentId, 'to null');
      
      question.set('parentId', null);
      
      // Save the question to persist the ancestry change
      question.save().then(() => {
        console.log('[CUSTOM DRAG] Question ancestry cleared successfully');
        
        // Reload the question and container to update UI
        question.reload().then(() => {
          container.reload().then(() => {
            // Clear the ancestry flag
            this.set('isSettingAncestry', false);
            
            // Now move the specific question to the pre-calculated target position
            console.log('[CUSTOM DRAG] Moving question to pre-calculated target position:', targetIndex);
            this.moveQuestionToPosition(question, targetIndex);
          });
        });
      }).catch((error) => {
        console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        this.set('isSettingAncestry', false);
      });
      
      this.send('hidePlacementModal');
    },

    placeBelowContainer() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'BELOW', container.get('questionText'));
      
      // Calculate target position BEFORE clearing ancestry
      const containerIndex = this.get('items').indexOf(container);
      const targetIndex = containerIndex + 1;
      console.log('[CUSTOM DRAG] Target position calculated:', targetIndex, 'for container at index:', containerIndex);
      
      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);
      
      // Clear ancestry and save
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Clearing ancestry from parentId:', oldParentId, 'to null');
      
      question.set('parentId', null);
      
      // Save the question to persist the ancestry change
      question.save().then(() => {
        console.log('[CUSTOM DRAG] Question ancestry cleared successfully');
        
        // Reload the question and container to update UI
        question.reload().then(() => {
          container.reload().then(() => {
            // Clear the ancestry flag
            this.set('isSettingAncestry', false);
            
            // Now move the specific question to the pre-calculated target position
            console.log('[CUSTOM DRAG] Moving question to pre-calculated target position:', targetIndex);
            this.moveQuestionToPosition(question, targetIndex);
          });
        });
      }).catch((error) => {
        console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        this.set('isSettingAncestry', false);
      });
      
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
      
      const items = this.get('items');
      const targetQuestion = items.objectAt(targetIndex);
      
      // Smart ancestry handling
      const currentParentId = selectedItem.get('parentId');
      const targetParentId = targetQuestion ? targetQuestion.get('parentId') : null;
      
      console.log('[CUSTOM DRAG] Smart ancestry check - currentParentId:', currentParentId, 'targetParentId:', targetParentId);
      
      // If moving from container to top level, clear ancestry
      if (currentParentId && !targetParentId) {
        console.log('[CUSTOM DRAG] Moving from container to top level, clearing ancestry');
        selectedItem.set('parentId', null);
        
        // Save the ancestry change first
        selectedItem.save().then(() => {
          console.log('[CUSTOM DRAG] Ancestry cleared successfully');
          this.send('performMoveLogic', selectedIndex, targetIndex);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        });
      } else {
        // No ancestry change needed, just move
        this.send('performMoveLogic', selectedIndex, targetIndex);
      }
    },

    performMoveLogic(fromIndex, toIndex) {
      const items = this.get('items').slice();
      const draggedItem = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, draggedItem);
      
      // Use parent's updateSortOrderTask to persist the changes to database
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('updateSortOrderTask')) {
        console.log('[CUSTOM DRAG] Using parent updateSortOrderTask to persist sort order changes');
        parentComponent.get('updateSortOrderTask').perform(items, false); // false = don't re-sort, use array order
      } else {
        console.error('[CUSTOM DRAG] Could not access parent updateSortOrderTask');
        // Fallback to onChange callback
        if (typeof this.get('onChange') === 'function') {
          run(() => {
            this.get('onChange')(items, draggedItem);
          });
        }
      }
      
      // Clear selection
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
      
      console.log('[CUSTOM DRAG] Move completed successfully');
    },

    moveQuestionToPosition(question, targetIndex) {
      console.log('[CUSTOM DRAG] moveQuestionToPosition called with question:', question.get('questionText'), 'targetIndex:', targetIndex);
      
      // Don't run if we're setting ancestry
      if (this.get('isSettingAncestry')) {
        console.log('[CUSTOM DRAG] Skipping moveQuestionToPosition because ancestry is being set');
        return;
      }
      
      const items = this.get('items');
      const currentIndex = items.indexOf(question);
      
      if (currentIndex === -1) {
        console.log('[CUSTOM DRAG] Question not found in items array');
        return;
      }
      
      if (currentIndex === targetIndex) {
        console.log('[CUSTOM DRAG] Question already at target position');
        return;
      }
      
      console.log('[CUSTOM DRAG] Move question from', currentIndex, 'to', targetIndex);
      
      const itemsCopy = items.slice();
      const draggedItem = itemsCopy.splice(currentIndex, 1)[0];
      itemsCopy.splice(targetIndex, 0, draggedItem);
      
      // Use parent's updateSortOrderTask to persist the changes to database
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('updateSortOrderTask')) {
        console.log('[CUSTOM DRAG] Using parent updateSortOrderTask to persist sort order changes');
        parentComponent.get('updateSortOrderTask').perform(itemsCopy, false); // false = don't re-sort, use array order
      } else {
        console.error('[CUSTOM DRAG] Could not access parent updateSortOrderTask');
        // Fallback to onChange callback
        if (typeof this.get('onChange') === 'function') {
          run(() => {
            this.get('onChange')(itemsCopy, draggedItem);
          });
        }
      }
      
      console.log('[CUSTOM DRAG] Question moved successfully');
    }
  },
  
  createDropZones() {
    run.scheduleOnce('afterRender', this, () => {
      const items = this.element.querySelectorAll('.sortable-item');
      const selectedItem = this.get('selectedItem');
      console.log('[CUSTOM DRAG] Creating drop zones for', items.length, 'items');
      
      if (!selectedItem) {
        console.log('[CUSTOM DRAG] No selected item, skipping drop zone creation');
        return;
      }
      
      // Determine if selected item is inside a container
      const selectedParentId = selectedItem.get('parentId');
      const isSelectedInsideContainer = selectedParentId !== null;
      console.log('[CUSTOM DRAG] Selected item parentId:', selectedParentId, 'isInsideContainer:', isSelectedInsideContainer);
      
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
          
          // Determine if this question is in the same container as the selected item
          const questionParentId = question ? question.get('parentId') : null;
          const isInSameContainer = questionParentId === selectedParentId;
          
          // Smart drop zone logic
          let shouldShowContainerDropZone = false;
          let shouldShowRegularDropZone = false;
          
          if (isSelectedInsideContainer) {
            // Selected item is inside a container
            if (isContainer) {
              // Always allow moving to other containers
              shouldShowContainerDropZone = true;
            } else if (isInSameContainer) {
              // Allow repositioning within the same container
              shouldShowRegularDropZone = true;
            }
            // Don't show regular drop zones for top-level questions when selected item is in container
          } else {
            // Selected item is at top level
            if (isContainer) {
              // Allow moving into containers
              shouldShowContainerDropZone = true;
            } else if (!questionParentId) {
              // Only allow repositioning at top level (questions with no parentId)
              shouldShowRegularDropZone = true;
            }
            // Don't show regular drop zones for questions inside containers when selected item is at top level
          }
          
          if (shouldShowContainerDropZone) {
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
          } else if (shouldShowRegularDropZone) {
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
          } else {
            console.log('[CUSTOM DRAG] No drop zone added for index:', index, 'question:', question ? question.get('questionText') : 'unknown');
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