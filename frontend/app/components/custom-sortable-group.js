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
      console.log('[CUSTOM DRAG] Select item called:', item.get('questionText'), 'at index:', index);
      console.log('[CUSTOM DRAG] Item isARepeater:', item.get('isARepeater'));
      console.log('[CUSTOM DRAG] Item isContainer:', item.get('isContainer'));
      console.log('[CUSTOM DRAG] Item parentId:', item.get('parentId'));
      console.log('[CUSTOM DRAG] Current selectedItem:', this.get('selectedItem') ? this.get('selectedItem').get('questionText') : 'null');
      console.log('[CUSTOM DRAG] Current selectedIndex:', this.get('selectedIndex'));
      
      if (this.get('selectedItem') === item) {
        // Deselect if clicking the same item
        console.log('[CUSTOM DRAG] Deselecting same item');
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
      } else {
        // Select new item
        console.log('[CUSTOM DRAG] Selecting new item');
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
      
      // Check if this is a container-to-container repositioning at the same level
      const selectedParentId = selectedItem.get('parentId');
      const containerParentId = containerQuestion.get('parentId');
      const selectedIsContainer = selectedItem.get('isARepeater') || selectedItem.get('isContainer');
      const targetIsContainer = containerQuestion.get('isARepeater') || containerQuestion.get('isContainer');
      
      // If both are containers at the same level, show placement modal with repositioning options
      if (selectedIsContainer && targetIsContainer && selectedParentId === containerParentId) {
        console.log('[CUSTOM DRAG] Container-to-container repositioning at same level');
        const questionName = selectedItem.get('questionText');
        const containerName = containerQuestion.get('questionText');
        console.log('[CUSTOM DRAG] Showing placement modal for container repositioning:', questionName, 'and container:', containerName);
        this.send('showPlacementModal', selectedItem, containerQuestion);
        return;
      }
      
      // Check two-level container rule for moving into containers
      // Determine current container level of selected item
      let selectedContainerLevel = 0;
      if (selectedParentId) {
        const selectedParent = items.findBy('id', selectedParentId);
        if (selectedParent && selectedParent.get('parentId')) {
          selectedContainerLevel = 2; // Inside a container that's inside another container
        } else {
          selectedContainerLevel = 1; // Inside a top-level container
        }
      }
      
      // Determine target container level
      let targetContainerLevel = 0;
      if (containerParentId) {
        targetContainerLevel = 2; // Container is inside another container
      } else {
        targetContainerLevel = 1; // Top-level container
      }
      
      console.log('[CUSTOM DRAG] Container levels - selected:', selectedContainerLevel, 'target:', targetContainerLevel);
      
      // Check if this move would violate the two-level rule
      if (selectedContainerLevel === 2 && targetContainerLevel === 2) {
        // Moving from Level 2 to Level 2 - check if they're in the same Level 1 container
        const selectedLevel1Container = items.findBy('id', selectedParentId);
        const targetLevel1Container = items.findBy('id', containerParentId);
        
        if (selectedLevel1Container && targetLevel1Container && 
            selectedLevel1Container.get('id') !== targetLevel1Container.get('id')) {
          console.log('[CUSTOM DRAG] Cannot move from Level 2 to Level 2 in different Level 1 containers');
          // Show error message or prevent the move
          return;
        }
      }
      
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
            
            // Check if the moved item is a container and handle children ancestry updates
            const isContainer = question.get('isARepeater') || question.get('isContainer');
            if (isContainer) {
              console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');
              const items = this.get('items');
              this.updateContainerChildrenAncestry(question, items);
            }
            
            this.send('moveQuestionToPosition', question, targetIndex);
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
            
            // Check if the moved item is a container and handle children ancestry updates
            const isContainer = question.get('isARepeater') || question.get('isContainer');
            if (isContainer) {
              console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');
              const items = this.get('items');
              this.updateContainerChildrenAncestry(question, items);
            }
            
            this.send('moveQuestionToPosition', question, targetIndex);
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
        console.log('[CUSTOM DRAG] No selected item or same position, returning');
        return;
      }
      
      console.log('[CUSTOM DRAG] Move item from', selectedIndex, 'to', targetIndex);
      console.log('[CUSTOM DRAG] Selected item:', selectedItem.get('questionText'), 'parentId:', selectedItem.get('parentId'));
      
      const items = this.get('items');
      const targetQuestion = items.objectAt(targetIndex);
      
      // Smart ancestry handling with two-level container rule
      const currentParentId = selectedItem.get('parentId');
      const targetParentId = targetQuestion ? targetQuestion.get('parentId') : null;
      
      console.log('[CUSTOM DRAG] Smart ancestry check - currentParentId:', currentParentId, 'targetParentId:', targetParentId);
      
      // Determine the current container level of the selected item
      let currentContainerLevel = 0;
      if (currentParentId) {
        const currentParent = items.findBy('id', currentParentId);
        if (currentParent && currentParent.get('parentId')) {
          currentContainerLevel = 2; // Inside a container that's inside another container
        } else {
          currentContainerLevel = 1; // Inside a top-level container
        }
      }
      
      // Determine the target container level
      let targetContainerLevel = 0;
      if (targetParentId) {
        const targetParent = items.findBy('id', targetParentId);
        if (targetParent && targetParent.get('parentId')) {
          targetContainerLevel = 2; // Moving to a container that's inside another container
        } else {
          targetContainerLevel = 1; // Moving to a top-level container
        }
      }
      
      console.log('[CUSTOM DRAG] Container levels - current:', currentContainerLevel, 'target:', targetContainerLevel);
      
      // Apply two-level container rule
      if (currentParentId && !targetParentId) {
        // Moving from inside a container to top level
        if (currentContainerLevel === 2) {
          // If moving from Level 2 to top level, set ancestry to the Level 1 container
          const level1Container = items.findBy('id', currentParentId);
          if (level1Container) {
            console.log('[CUSTOM DRAG] Moving from Level 2 to top level, setting ancestry to Level 1 container:', level1Container.get('questionText'));
            selectedItem.set('parentId', level1Container.get('id'));
          } else {
            console.log('[CUSTOM DRAG] Moving from Level 2 to top level, clearing ancestry (no Level 1 container found)');
            selectedItem.set('parentId', null);
          }
        } else {
          // Moving from Level 1 to top level, clear ancestry
          console.log('[CUSTOM DRAG] Moving from Level 1 to top level, clearing ancestry');
          selectedItem.set('parentId', null);
        }
        
        // Save the ancestry change first
        selectedItem.save().then(() => {
          console.log('[CUSTOM DRAG] Ancestry updated successfully');
          this.send('performMoveLogic', selectedIndex, targetIndex);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error updating ancestry:', error);
        });
      } else if (currentParentId && targetParentId) {
        // Moving from one container to another container
        if (currentContainerLevel === 2 && targetContainerLevel === 1) {
          // Moving from Level 2 to Level 1 container
          console.log('[CUSTOM DRAG] Moving from Level 2 to Level 1 container');
          selectedItem.set('parentId', targetParentId);
          
          selectedItem.save().then(() => {
            console.log('[CUSTOM DRAG] Ancestry updated successfully');
            this.send('performMoveLogic', selectedIndex, targetIndex);
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error updating ancestry:', error);
          });
        } else {
          // Other container-to-container moves (Level 1 to Level 1, Level 2 to Level 2, Level 1 to Level 2)
          console.log('[CUSTOM DRAG] Container-to-container move, no ancestry change needed');
          this.send('performMoveLogic', selectedIndex, targetIndex);
        }
      } else {
        // No ancestry change needed, just move
        console.log('[CUSTOM DRAG] No ancestry change needed, performing simple move');
        this.send('performMoveLogic', selectedIndex, targetIndex);
      }
    },

    performMoveLogic(fromIndex, toIndex) {
      const items = this.get('items').slice();
      const draggedItem = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, draggedItem);
      
      // Check if the moved item is a container and handle children ancestry updates
      const isContainer = draggedItem.get('isARepeater') || draggedItem.get('isContainer');
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved, updating children ancestry');
        this.updateContainerChildrenAncestry(draggedItem, items);
      }
      
      // Use parent's updateSortOrderTask to persist the changes to database
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('updateSortOrderTask')) {
        console.log('[CUSTOM DRAG] Using parent updateSortOrderTask to persist sort order changes');
        
        // Clear selection immediately to prevent issues
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
        
        // Perform the update and ensure selection is cleared after completion
        parentComponent.get('updateSortOrderTask').perform(items, false).then(() => {
          console.log('[CUSTOM DRAG] Parent updateSortOrderTask completed, ensuring selection is cleared');
          // Double-check that selection is cleared after UI refresh
          this.set('selectedItem', null);
          this.set('selectedIndex', -1);
          this.removeDropZones();
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error in parent updateSortOrderTask:', error);
          // Ensure selection is cleared even on error
          this.set('selectedItem', null);
          this.set('selectedIndex', -1);
          this.removeDropZones();
        });
      } else {
        console.error('[CUSTOM DRAG] Could not access parent updateSortOrderTask');
        // Fallback to onChange callback
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
      
      console.log('[CUSTOM DRAG] Move completed successfully');
    },

    updateContainerChildrenAncestry(container, items) {
      console.log('[CUSTOM DRAG] Updating children ancestry for container:', container.get('questionText'));
      
      // Find all children of this container
      const containerId = container.get('id');
      const children = items.filter(item => item.get('parentId') === containerId);
      
      console.log('[CUSTOM DRAG] Found', children.length, 'children to update');
      
      if (children.length === 0) {
        console.log('[CUSTOM DRAG] No children to update');
        return;
      }
      
      // Determine the new container level
      const containerParentId = container.get('parentId');
      let newContainerLevel = 0;
      if (containerParentId) {
        const containerParent = items.findBy('id', containerParentId);
        if (containerParent && containerParent.get('parentId')) {
          newContainerLevel = 2; // Container is inside another container
        } else {
          newContainerLevel = 1; // Container is at top level
        }
      }
      
      console.log('[CUSTOM DRAG] Container moved to level:', newContainerLevel);
      
      // Update children based on the two-level container rule
      const updatePromises = children.map(child => {
        const childParentId = child.get('parentId');
        let newParentId = childParentId; // Default to current parent
        
        if (newContainerLevel === 2) {
          // Container is now at Level 2 (inside another container)
          // Children should remain inside this container (parentId = containerId)
          newParentId = containerId;
        } else if (newContainerLevel === 1) {
          // Container is now at Level 1 (top level)
          // Children should remain inside this container (parentId = containerId)
          newParentId = containerId;
        } else {
          // Container is now at top level (no parent)
          // Children should remain inside this container (parentId = containerId)
          newParentId = containerId;
        }
        
        if (childParentId !== newParentId) {
          console.log('[CUSTOM DRAG] Updating child', child.get('questionText'), 'parentId from', childParentId, 'to', newParentId);
          child.set('parentId', newParentId);
          return child.save();
        } else {
          console.log('[CUSTOM DRAG] Child', child.get('questionText'), 'parentId unchanged:', childParentId);
          return Promise.resolve();
        }
      });
      
      // Wait for all children to be updated
      Promise.all(updatePromises).then(() => {
        console.log('[CUSTOM DRAG] All children ancestry updated successfully');
      }).catch((error) => {
        console.error('[CUSTOM DRAG] Error updating children ancestry:', error);
      });
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
            if (question) {
              console.log('[CUSTOM DRAG] Found question at index', index, ':', question.get('questionText'), 'isARepeater:', question.get('isARepeater'), 'isContainer:', question.get('isContainer'));
              if (question.get('isARepeater') || question.get('isContainer')) {
                isContainer = true;
                console.log('[CUSTOM DRAG] Question identified as container');
              }
            }
          }
          
          // Determine if this question is in the same container as the selected item
          const questionParentId = question ? question.get('parentId') : null;
          const isInSameContainer = questionParentId === selectedParentId;
          
          // Smart drop zone logic with two-level container rule
          let shouldShowContainerDropZone = false;
          let shouldShowRegularDropZone = false;
          
          // Determine selected item's container level
          let selectedContainerLevel = 0;
          if (selectedParentId) {
            const selectedParent = this.get('items').findBy('id', selectedParentId);
            if (selectedParent && selectedParent.get('parentId')) {
              selectedContainerLevel = 2; // Inside a container that's inside another container
            } else {
              selectedContainerLevel = 1; // Inside a top-level container
            }
          }
          
          // Determine target question's container level
          let targetContainerLevel = 0;
          if (questionParentId) {
            const targetParent = this.get('items').findBy('id', questionParentId);
            if (targetParent && targetParent.get('parentId')) {
              targetContainerLevel = 2; // Inside a container that's inside another container
            } else {
              targetContainerLevel = 1; // Inside a top-level container
            }
          }
          
          if (isSelectedInsideContainer) {
            // Selected item is inside a container
            if (isContainer) {
              // Check two-level container rule for container-to-container moves
              if (selectedContainerLevel === 2 && targetContainerLevel === 2) {
                // Moving from Level 2 to Level 2 - only allow if they're in the same Level 1 container
                const selectedLevel1Container = this.get('items').findBy('id', selectedParentId);
                const targetLevel1Container = this.get('items').findBy('id', questionParentId);
                
                if (selectedLevel1Container && targetLevel1Container && 
                    selectedLevel1Container.get('id') === targetLevel1Container.get('id')) {
                  shouldShowContainerDropZone = true;
                }
              } else {
                // Other container-to-container moves are allowed
                shouldShowContainerDropZone = true;
              }
            } else if (isInSameContainer) {
              // Allow repositioning within the same container
              shouldShowRegularDropZone = true;
            }
            // Don't show regular drop zones for top-level questions when selected item is in container
          } else {
            // Selected item is at top level
            if (isContainer) {
              // Always show container drop zone for containers (allows placement modal with options)
              if (targetContainerLevel === 2) {
                // Moving into a Level 2 container - this is allowed from top level
                shouldShowContainerDropZone = true;
              } else {
                // Moving into a Level 1 container - this is always allowed from top level
                shouldShowContainerDropZone = true;
              }
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
  },

  // Ensure selection is cleared when component updates
  didUpdate() {
    this._super(...arguments);
    
    // If we have a selected item but it's no longer in the items array, clear selection
    const selectedItem = this.get('selectedItem');
    const items = this.get('items');
    
    if (selectedItem && !items.includes(selectedItem)) {
      console.log('[CUSTOM DRAG] Selected item no longer in items array, clearing selection');
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    }
  }
}); 