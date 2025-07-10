import Component from '@ember/component';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: 'ul',
  classNames: ['sortable', 'ui-sortable'],
  
  // Properties
  items: [],
  isFullyEditable: null,
  onChange: null,
  
  // Internal state
  selectedItem: null,
  selectedIndex: -1,
  isSettingAncestry: false,
  showPlacementOptions: false,
  placementQuestion: null,
  placementContainer: null,
  highlightTimeout: null,
  cleanupTimeouts: [],
  activeEventListeners: [],
  isMovingContainer: false, // Flag to prevent UI refresh during container moves
  
  actions: {
    selectItem(item, index) {
      console.log('[CUSTOM DRAG] Select item called:', item.get('questionText'), 'at index:', index);
      console.log('[CUSTOM DRAG] Item isARepeater:', item.get('isARepeater'));
      console.log('[CUSTOM DRAG] Item isContainer:', item.get('isContainer'));
      console.log('[CUSTOM DRAG] Item parentId:', item.get('parentId'));
      console.log('[CUSTOM DRAG] Item id:', item.get('id'));
      console.log('[CUSTOM DRAG] Current selectedItem:', this.get('selectedItem') ? this.get('selectedItem').get('questionText') : 'null');
      console.log('[CUSTOM DRAG] Current selectedIndex:', this.get('selectedIndex'));
      
      // Check if survey template is locked - prevent selection if not fully editable
      const isFullyEditable = this.get('isFullyEditable');
      if (!isFullyEditable) {
        console.log('[CUSTOM DRAG] Survey template is not fully editable, preventing selection');
        return;
      }
      
      // Check if item is in the current items array
      const items = this.get('items');
      const itemInArray = items.findBy('id', item.get('id'));
      console.log('[CUSTOM DRAG] Item found in array:', !!itemInArray);
      console.log('[CUSTOM DRAG] Item index in array:', items.indexOf(itemInArray));
      
      if (this.get('selectedItem') === item) {
        // Deselect if clicking the same item
        console.log('[CUSTOM DRAG] Deselecting same item');
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
        this.removeChildrenHighlight();
        this.cleanupAfterMove();
      } else {
        // Select new item
        console.log('[CUSTOM DRAG] Selecting new item');
        
        // Clean up before selecting new item
        this.cleanupAfterMove();
        
        this.set('selectedItem', item);
        this.set('selectedIndex', index);
        this.createDropZones();
        
        // Only highlight children if this is a container
        const isContainer = item.get('isARepeater') || item.get('isContainer');
        if (isContainer) {
          console.log('[CUSTOM DRAG] Selected item is a container, highlighting children');
          // Debounce highlighting to prevent performance issues
          const timeout = run.later(this, () => {
            this.highlightChildren(item);
          }, 100); // Increased delay for better debouncing
          
          this.registerTimeout(timeout, 'highlight');
        } else {
          console.log('[CUSTOM DRAG] Selected item is not a container, skipping children highlight');
        }
      }
    },

    clearSelection() {
      console.log('[CUSTOM DRAG] Clearing selection');
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
      this.removeChildrenHighlight();
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
      
      // Check if the question being moved is a container with children
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      const items = this.get('items');
      const children = isContainer ? items.filter(item => item.get('parentId') === question.get('id')) : [];
      
      console.log('[CUSTOM DRAG] Question is container:', isContainer, 'with', children.length, 'children');
      
      // Use parent's setAncestryTask for consistency
      const parentComponent = this.get('parentView');
      if (parentComponent) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for inside top placement');
        
        // Ensure the container is expanded so the placed item will be visible
        if (container.get('collapsed')) {
          console.log('[CUSTOM DRAG] Container is collapsed, expanding it');
          const collapsible = parentComponent.get('collapsible');
          if (collapsible) {
            collapsible.toggleCollapsed(container);
          }
        }
        
        // For containers, use strict sequencing: move parent, wait for UI refresh, then update children
        if (isContainer) {
          console.log('[CUSTOM DRAG] Using strict sequencing for container move (INSIDE TOP)');
          this.set('isMovingContainer', true);
          
          // Store the children BEFORE any moves happen, sorted by their current sortOrder
          const items = this.get('items');
          const containerId = question.get('id');
          const allChildren = items.filter(item => item.get('parentId') === containerId);
          // Sort children by their current sortOrder to preserve their intended order
          const childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
          console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move');
          console.log('[CUSTOM DRAG] Children before move (sorted by sortOrder):', childrenBeforeMove.map(c => ({
            id: c.get('id'),
            text: c.get('questionText'),
            parentId: c.get('parentId'),
            sortOrder: c.get('sortOrder')
          })));
          
          // Step 1: Move the container and save it (INSIDE TOP - place before first child)
          const targetContainerId = container.get('id');
          
          // Find the first child of the container to place before it
          const containerChildren = items.filter(item => item.get('parentId') === targetContainerId);
          let newSortOrder;
          
          if (containerChildren.length > 0) {
            // Find the minimum sortOrder among existing children and place before it
            const minChildSortOrder = Math.min(...containerChildren.map(child => child.get('sortOrder')));
            newSortOrder = minChildSortOrder;
            console.log('[CUSTOM DRAG] Placing container before first child with sortOrder:', newSortOrder, '(min child sortOrder was:', minChildSortOrder, ')');
          } else {
            // No children, use container's sortOrder + 1
            newSortOrder = container.get('sortOrder') + 1;
            console.log('[CUSTOM DRAG] No children, placing container after container with sortOrder:', newSortOrder);
          }
          
          // Set parentId to make it a child of the container
          question.set('parentId', targetContainerId);
          question.set('sortOrder', newSortOrder);
          
          console.log('[CUSTOM DRAG] Set parentId to container and sortOrder to:', newSortOrder);
          
                      question.save().then(() => {
              console.log('[CUSTOM DRAG] Step 1: Container moved and saved (INSIDE TOP)');
              console.log('[CUSTOM DRAG] Container after move - parentId:', question.get('parentId'), 'sortOrder:', question.get('sortOrder'));
              
              // Step 2: Reload the container to ensure we have fresh data
              question.reload().then(() => {
                console.log('[CUSTOM DRAG] Step 2: Container reloaded');
                
                // Step 2.5: Reposition the container as the first child in the array
                const fullQuestions = parentComponent.get('fullQuestions');
                const targetContainerIndex = fullQuestions.indexOf(container);
                console.log('[CUSTOM DRAG] Target container index:', targetContainerIndex);
                
                if (targetContainerIndex !== -1) {
                  // Remove the container from its current position FIRST
                  const containerIndex = fullQuestions.indexOf(question);
                  console.log('[CUSTOM DRAG] Container current index:', containerIndex);
                  if (containerIndex !== -1) {
                    fullQuestions.removeAt(containerIndex);
                    console.log('[CUSTOM DRAG] Removed container from index:', containerIndex);
                  }
                  
                  // Insert it right after the target container (as first child)
                  const insertIndex = targetContainerIndex + 1;
                  fullQuestions.insertAt(insertIndex, question);
                  console.log('[CUSTOM DRAG] Inserted container at index:', insertIndex, 'right after target container');
                }
                
                // Step 3: Update children ancestry BEFORE any UI refresh
                this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
              }).catch((error) => {
                console.error('[CUSTOM DRAG] Error in Step 2 (container reload):', error);
                this.set('isSettingAncestry', false);
                this.set('isMovingContainer', false);
                this.cleanupAfterMove();
              });
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error in Step 1 (container save):', error);
              this.set('isSettingAncestry', false);
              this.set('isMovingContainer', false);
              this.cleanupAfterMove();
            });
        } else {
          // For non-containers, manually set ancestry and sort order for INSIDE TOP placement
          console.log('[CUSTOM DRAG] Using manual ancestry setting for single question (INSIDE TOP)');
          
          // Ensure the container is expanded so the placed item will be visible
          if (container.get('collapsed')) {
            console.log('[CUSTOM DRAG] Container is collapsed, expanding it');
            const collapsible = parentComponent.get('collapsible');
            if (collapsible) {
              collapsible.toggleCollapsed(container);
            }
          }
          
          // Find the first child of the container to place before it
          const containerChildren = items.filter(item => item.get('parentId') === container.get('id'));
          let newSortOrder;
          
          if (containerChildren.length > 0) {
            // Find the minimum sortOrder among existing children and place before it
            const minChildSortOrder = Math.min(...containerChildren.map(child => child.get('sortOrder')));
            newSortOrder = minChildSortOrder;
            console.log('[CUSTOM DRAG] Placing single question before first child with sortOrder:', newSortOrder, '(min child sortOrder was:', minChildSortOrder, ')');
          } else {
            // No children, use container's sortOrder + 1
            newSortOrder = container.get('sortOrder') + 1;
            console.log('[CUSTOM DRAG] No children, placing single question after container with sortOrder:', newSortOrder);
          }
          
          // Set parentId to make it a child of the container
          question.set('parentId', container.get('id'));
          question.set('sortOrder', newSortOrder);
          
          console.log('[CUSTOM DRAG] Set parentId to container and sortOrder to:', newSortOrder);
          
                      question.save().then(() => {
              console.log('[CUSTOM DRAG] Single question moved and saved (INSIDE TOP)');
              console.log('[CUSTOM DRAG] Question after move - parentId:', question.get('parentId'), 'sortOrder:', question.get('sortOrder'));
              
              // Reload the question to ensure we have fresh data
              question.reload().then(() => {
                console.log('[CUSTOM DRAG] Single question reloaded');
                
                // Reposition the question as the first child in the array before calling updateSortOrderTask
                const fullQuestions = parentComponent.get('fullQuestions');
                const containerIndex = fullQuestions.indexOf(container);
                console.log('[CUSTOM DRAG] Container index:', containerIndex);
                
                if (containerIndex !== -1) {
                  // Remove the question from its current position FIRST
                  const questionIndex = fullQuestions.indexOf(question);
                  console.log('[CUSTOM DRAG] Question current index:', questionIndex);
                  if (questionIndex !== -1) {
                    fullQuestions.removeAt(questionIndex);
                    console.log('[CUSTOM DRAG] Removed question from index:', questionIndex);
                  }
                  
                  // Find the first child of the container to insert before it
                  const containerChildren = fullQuestions.filter(q => q.get('parentId') === container.get('id'));
                  let insertIndex;
                  
                  if (containerChildren.length > 0) {
                    // Find the first child's position in the array
                    const firstChild = containerChildren[0];
                    const firstChildIndex = fullQuestions.indexOf(firstChild);
                    insertIndex = firstChildIndex;
                    console.log('[CUSTOM DRAG] Inserting question before first child at index:', insertIndex);
                  } else {
                    // No children, insert right after the container
                    insertIndex = containerIndex + 1;
                    console.log('[CUSTOM DRAG] No children, inserting question after container at index:', insertIndex);
                  }
                  
                  fullQuestions.insertAt(insertIndex, question);
                  console.log('[CUSTOM DRAG] Inserted question at index:', insertIndex);
                }
                
                // For inside top placement, we need to call updateSortOrderTask to normalize sortOrders
                // but we need to ensure the question stays as the first child
                console.log('[CUSTOM DRAG] Calling updateSortOrderTask for inside top placement with integer sortOrders');
                console.log('[CUSTOM DRAG] Array order before updateSortOrderTask:', fullQuestions.map((q, i) => ({
                  index: i,
                  id: q.get('id'),
                  text: q.get('questionText'),
                  parentId: q.get('parentId'),
                  sortOrder: q.get('sortOrder')
                })));
                
                parentComponent.get('updateSortOrderTask').perform(fullQuestions, false).then(() => {
                  console.log('[CUSTOM DRAG] UI refreshed after inside top placement');
                  console.log('[CUSTOM DRAG] Final array order after updateSortOrderTask:', fullQuestions.map((q, i) => ({
                    index: i,
                    id: q.get('id'),
                    text: q.get('questionText'),
                    parentId: q.get('parentId'),
                    sortOrder: q.get('sortOrder')
                  })));
                  this.set('isSettingAncestry', false);
                  this.cleanupAfterMove();
                }).catch((error) => {
                  console.error('[CUSTOM DRAG] Error refreshing UI:', error);
                  this.set('isSettingAncestry', false);
                  this.cleanupAfterMove();
                });
              }).catch((error) => {
                console.error('[CUSTOM DRAG] Error reloading single question:', error);
                this.set('isSettingAncestry', false);
                this.cleanupAfterMove();
              });
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error saving single question:', error);
              this.set('isSettingAncestry', false);
              this.cleanupAfterMove();
            });
        }
      } else {
        console.error('[CUSTOM DRAG] Could not access parent component');
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
      
      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const items = this.get('items');
        const containerId = question.get('id');
        const allChildren = items.filter(item => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for above/below placement');
        console.log('[CUSTOM DRAG] Children before move (sorted by sortOrder):', childrenBeforeMove.map(c => ({
          id: c.get('id'),
          text: c.get('questionText'),
          parentId: c.get('parentId'),
          sortOrder: c.get('sortOrder')
        })));
      }
      
      // Clear ancestry and save
      const containerParentId = container.get('parentId');
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to container parentId:', containerParentId);

      question.set('parentId', containerParentId);

      // Save the question to persist the ancestry change
      question.save().then(() => {
        console.log('[CUSTOM DRAG] Question ancestry set to container parentId successfully');
        
        // Reload the question and container to update UI
        question.reload().then(() => {
          container.reload().then(() => {
            // Clear the ancestry flag
            this.set('isSettingAncestry', false);
            
            // Now move the specific question to the pre-calculated target position
            console.log('[CUSTOM DRAG] Moving question to pre-calculated target position:', targetIndex);
            
            // Check if the moved item is a container and handle children ancestry updates
            if (isContainer) {
              console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');
              const items = this.get('items');
              this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
            }
            
            this.send('moveQuestionToPosition', question, targetIndex);
          });
        });
      }).catch((error) => {
        console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        this.set('isSettingAncestry', false);
        this.cleanupAfterMove();
      });
      
      this.send('hidePlacementModal');
    },

    placeBelowContainer() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');
      
      if (!question || !container) return;
      
      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'BELOW', container.get('questionText'));
      
      // Calculate target position that accounts for container's children
      const items = this.get('items');
      const containerIndex = items.indexOf(container);
      
      // Find the last child of the container to place after it
      let targetIndex = containerIndex + 1;
      const containerId = container.get('id');
      
      // Look for all children of this container and find the last one
      console.log('[CUSTOM DRAG] Looking for children of container:', container.get('questionText'), 'with ID:', containerId);
      for (let i = containerIndex + 1; i < items.length; i++) {
        const item = items.objectAt(i);
        console.log('[CUSTOM DRAG] Checking item at index', i, ':', item.get('questionText'), 'parentId:', item.get('parentId'));
        
        if (item.get('parentId') === containerId) {
          targetIndex = i + 1; // Place after this child
          console.log('[CUSTOM DRAG] Found child, updating targetIndex to:', targetIndex);
        } else if (!item.get('parentId')) {
          // We've reached a top-level item, stop looking
          console.log('[CUSTOM DRAG] Reached top-level item, stopping search');
          break;
        }
      }
      
      console.log('[CUSTOM DRAG] Target position calculated:', targetIndex, 'for container at index:', containerIndex);
      
      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);
      
      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const containerId = question.get('id');
        const allChildren = items.filter(item => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for below placement');
        console.log('[CUSTOM DRAG] Children before move (sorted by sortOrder):', childrenBeforeMove.map(c => ({
          id: c.get('id'),
          text: c.get('questionText'),
          parentId: c.get('parentId'),
          sortOrder: c.get('sortOrder')
        })));
      }
      
      // Clear ancestry and save
      const containerParentId = container.get('parentId');
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to container parentId:', containerParentId);

      question.set('parentId', containerParentId);

      // Save the question to persist the ancestry change
      question.save().then(() => {
        console.log('[CUSTOM DRAG] Question ancestry set to container parentId successfully');
        
        // Reload the question and container to update UI
        question.reload().then(() => {
          container.reload().then(() => {
            // Clear the ancestry flag
            this.set('isSettingAncestry', false);
            
            // Now move the specific question to the pre-calculated target position
            console.log('[CUSTOM DRAG] Moving question to pre-calculated target position:', targetIndex);
            
            // Check if the moved item is a container and handle children ancestry updates
            if (isContainer) {
              console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');
              this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
            }
            
            // Use moveQuestionToPosition which calls updateSortOrderTask with reSort=false
            this.send('moveQuestionToPosition', question, targetIndex);
          });
        });
      }).catch((error) => {
        console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
        this.set('isSettingAncestry', false);
        this.cleanupAfterMove();
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
          
          // Reload the item to get the updated data
          selectedItem.reload().then(() => {
            console.log('[CUSTOM DRAG] Item reloaded, new parentId:', selectedItem.get('parentId'));
            
            // Force a UI refresh by calling the parent's updateSortOrderTask with the current data
            const parentComponent = this.get('parentView');
            if (parentComponent && parentComponent.get('updateSortOrderTask')) {
              console.log('[CUSTOM DRAG] Forcing UI refresh after ancestry change');
              parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true);
            }
            
            // Now perform the move
            this.send('performMoveLogic', selectedIndex, targetIndex);
          });
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
            
            // Reload the item to get the updated data
            selectedItem.reload().then(() => {
              console.log('[CUSTOM DRAG] Item reloaded, new parentId:', selectedItem.get('parentId'));
              
              // Force a complete refresh of this component
              this.forceRefresh();
              
              // Wait for the refresh to complete, then perform the move
              run.scheduleOnce('afterRender', this, () => {
                console.log('[CUSTOM DRAG] After force refresh, checking UI state');
                this.checkUIState();
                
                run.scheduleOnce('afterRender', this, () => {
                  console.log('[CUSTOM DRAG] Performing move after UI state check');
                  this.send('performMoveLogic', selectedIndex, targetIndex);
                });
              });
            });
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
      // Get the current items array (which should reflect any ancestry changes)
      const items = this.get('items').slice();
      
      // Find the dragged item by ID to ensure we have the latest data
      const selectedItem = this.get('selectedItem');
      let draggedItem = null;
      let actualFromIndex = fromIndex;
      
      if (selectedItem) {
        // Find the item by ID in case the index has changed
        const itemId = selectedItem.get('id');
        draggedItem = items.findBy('id', itemId);
        if (draggedItem) {
          actualFromIndex = items.indexOf(draggedItem);
          console.log('[CUSTOM DRAG] Found dragged item by ID at index:', actualFromIndex);
        }
      }
      
      if (!draggedItem) {
        // Fallback to original logic
        draggedItem = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, draggedItem);
      } else {
        // Use the found item and its actual index
        items.splice(actualFromIndex, 1);
        items.splice(toIndex, 0, draggedItem);
      }
      
      console.log('[CUSTOM DRAG] performMoveLogic - draggedItem:', draggedItem.get('questionText'), 'parentId:', draggedItem.get('parentId'));
      console.log('[CUSTOM DRAG] performMoveLogic - fromIndex:', actualFromIndex, 'toIndex:', toIndex);
      
      // Check if the moved item is a container and handle children ancestry updates
      const isContainer = draggedItem.get('isARepeater') || draggedItem.get('isContainer');
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved, handling children properly');
        
        // Find all children of this container
        const containerId = draggedItem.get('id');
        const children = items.filter(item => item.get('parentId') === containerId);
        
        console.log('[CUSTOM DRAG] Found', children.length, 'children to move with container');
        
        // Store the old parent ID for comparison
        const oldParentId = selectedItem ? selectedItem.get('parentId') : null;
        const newParentId = draggedItem.get('parentId');
        
        console.log('[CUSTOM DRAG] Container move - oldParentId:', oldParentId, 'newParentId:', newParentId);
        
        // Update children ancestry and ensure they move with the container
        if (children.length > 0) {
          // First, update the children's ancestry to reflect the new container position
          this.send('updateContainerChildrenAncestry', draggedItem, items);
          
          // Then, ensure children are properly positioned in the items array
          // Children should appear right after their container in the UI
          const containerIndex = items.indexOf(draggedItem);
          const childrenToMove = children.slice(); // Create a copy to avoid mutation issues
          
          // Remove children from their current positions
          childrenToMove.forEach(child => {
            const childIndex = items.indexOf(child);
            if (childIndex !== -1) {
              items.splice(childIndex, 1);
            }
          });
          
          // Insert children right after the container
          childrenToMove.forEach((child, index) => {
            const insertIndex = containerIndex + 1 + index;
            items.splice(insertIndex, 0, child);
          });
          
          console.log('[CUSTOM DRAG] Repositioned', childrenToMove.length, 'children after container');
        }
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
          this.cleanupAfterMove();
          
          // Force a re-render to ensure the UI is updated
          run.scheduleOnce('afterRender', this, () => {
            console.log('[CUSTOM DRAG] After render, ensuring drop zones are removed');
            this.removeDropZones();
          });
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error in parent updateSortOrderTask:', error);
          // Ensure selection is cleared even on error
          this.set('selectedItem', null);
          this.set('selectedIndex', -1);
          this.removeDropZones();
          this.cleanupAfterMove();
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

    updateContainerChildrenAncestry(container, items, childrenBeforeMove) {
      console.log('[CUSTOM DRAG] Updating children ancestry for container:', container.get('questionText'));
      const containerId = container.get('id');
      console.log('[CUSTOM DRAG] childrenBeforeMove parameter:', childrenBeforeMove ? childrenBeforeMove.map(c => ({
        id: c.get('id'),
        text: c.get('questionText'),
        parentId: c.get('parentId'),
        sortOrder: c.get('sortOrder')
      })) : 'null/undefined');
      
      // Only update DIRECT children of the container (not all descendants)
      // The descendants will be moved automatically when their parent containers move
      const directChildren = items.filter(item => item.get('parentId') === containerId);
      console.log('[CUSTOM DRAG] Found', directChildren.length, 'direct children to update');
      console.log('[CUSTOM DRAG] Direct children:', directChildren.map(d => ({
        id: d.get('id'),
        text: d.get('questionText'),
        parentId: d.get('parentId'),
        sortOrder: d.get('sortOrder')
      })));
      
      if (directChildren.length === 0) {
        console.log('[CUSTOM DRAG] No direct children to update');
        // Even if no direct children, still refresh UI and clear flags
        const parentComponent = this.get('parentView');
        if (parentComponent && parentComponent.get('updateSortOrderTask')) {
          parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true).then(() => {
            this.set('isSettingAncestry', false);
            this.set('isMovingContainer', false);
            console.log('[CUSTOM DRAG] UI refreshed after container move (no direct children)');
          });
        } else {
          this.set('isSettingAncestry', false);
          this.set('isMovingContainer', false);
        }
        return;
      }
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('setAncestryTask')) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for children updates');
        
        // Update children sequentially to avoid race conditions
        const updateChildrenSequentially = async () => {
          console.log('[CUSTOM DRAG] Step 4: Starting children updates');
          
          // Step 4a: Use the directChildren array (only direct children, not nested)
          console.log('[CUSTOM DRAG] Using directChildren array:', directChildren.map(c => ({
            text: c.get('questionText'),
            sortOrder: c.get('sortOrder'),
            parentId: c.get('parentId')
          })));
          
          // Sort direct children by their current sortOrder to preserve their intended order
          const sortedDirectChildren = directChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
          
          // Step 4b: Update all direct children in their original order
          // Calculate the base sort order for direct children (right after the container)
          const baseSortOrder = container.get('sortOrder') + 0.001;
          
          // Find the minimum sort order among direct children to calculate relative offsets
          const minChildSortOrder = Math.min(...sortedDirectChildren.map(child => child.get('sortOrder')));
          
          for (let i = 0; i < sortedDirectChildren.length; i++) {
            const child = sortedDirectChildren[i];
            // Preserve the relative sort order difference from the minimum
            const relativeOffset = child.get('sortOrder') - minChildSortOrder;
            const newSortOrder = baseSortOrder + relativeOffset;
            
            console.log('[CUSTOM DRAG] Updating direct child', child.get('questionText'), 'parentId to', containerId, 'sortOrder to', newSortOrder, '(original sortOrder was', child.get('sortOrder'), ', relativeOffset was', relativeOffset, ')');
            
            // Update direct child only
            child.set('parentId', containerId);
            child.set('sortOrder', newSortOrder);
            
            try {
              const savedChild = await child.save();
              console.log('[CUSTOM DRAG] Direct child', child.get('questionText'), 'saved successfully');
              console.log('[CUSTOM DRAG] Saved direct child data:', {
                id: savedChild.get('id'),
                text: savedChild.get('questionText'),
                parentId: savedChild.get('parentId'),
                sortOrder: savedChild.get('sortOrder'),
                ancestry: savedChild.get('ancestry')
              });
            } catch (error) {
              console.error('[CUSTOM DRAG] Error saving direct child', child.get('questionText'), ':', error);
            }
          }
          
          console.log('[CUSTOM DRAG] Step 4b: All direct children updated successfully');
          
          // Step 4c: Reload all direct children to ensure they have the latest data
          const reloadPromises = sortedDirectChildren.map(child => child.reload());
          await Promise.all(reloadPromises);
          console.log('[CUSTOM DRAG] Step 4c: All direct children reloaded');
          
          // Step 4d: Create a properly ordered array for the final UI refresh
          console.log('[CUSTOM DRAG] Step 4d: Creating properly ordered array for final UI refresh');
          
          // Get the current full questions array
          const fullQuestions = parentComponent.get('fullQuestions');
          
          // Create a new array with the correct order: container first, then ALL its descendants
          const properlyOrderedQuestions = [];
          const processedIds = new Set();
          
          // Get ALL descendants of the container (not just direct children)
          const allDescendants = this.getAllDescendants(container.get('id'), fullQuestions);
          console.log('[CUSTOM DRAG] All descendants of moved container:', allDescendants.map(d => ({
            id: d.get('id'),
            text: d.get('questionText'),
            parentId: d.get('parentId'),
            sortOrder: d.get('sortOrder')
          })));
          
          // Add all questions in their current order, but ensure container and ALL descendants are together
          fullQuestions.forEach(question => {
            const questionId = question.get('id');
            
            // Skip if already processed
            if (processedIds.has(questionId)) {
              return;
            }
            
            // If this is the moved container, add it and ALL its descendants
            if (questionId === container.get('id')) {
              properlyOrderedQuestions.push(question);
              processedIds.add(questionId);
              
              // Add ALL descendants of this container (including nested children)
              allDescendants.forEach(descendant => {
                if (!processedIds.has(descendant.get('id'))) {
                  properlyOrderedQuestions.push(descendant);
                  processedIds.add(descendant.get('id'));
                }
              });
            } else {
              // Add other questions normally
              properlyOrderedQuestions.push(question);
              processedIds.add(questionId);
            }
          });
          
          console.log('[CUSTOM DRAG] Properly ordered questions for final refresh:', properlyOrderedQuestions.map(q => ({
            id: q.get('id'),
            text: q.get('questionText'),
            parentId: q.get('parentId'),
            sortOrder: q.get('sortOrder')
          })));
          
          // Use the properly ordered array for the final UI refresh
          parentComponent.get('updateSortOrderTask').perform(properlyOrderedQuestions, false).then(() => {
            console.log('[CUSTOM DRAG] Step 4d: Final UI refresh completed with proper ordering');
            this.set('isSettingAncestry', false);
            this.set('isMovingContainer', false);
            this.cleanupAfterMove();
            
            // Log ancestry/sortOrder of all direct children after final UI refresh
            const refreshedDirectChildren = directChildren.map(c => ({
              id: c.get('id'),
              text: c.get('questionText'),
              parentId: c.get('parentId'),
              sortOrder: c.get('sortOrder'),
              ancestry: c.get('ancestry')
            }));
            console.log('[CUSTOM DRAG] Final direct children state after move:', refreshedDirectChildren);
          });
        };
        
        updateChildrenSequentially().catch((error) => {
          console.error('[CUSTOM DRAG] Error in sequential children update:', error);
          this.set('isSettingAncestry', false);
          this.set('isMovingContainer', false);
          this.cleanupAfterMove();
        });
      } else {
        console.error('[CUSTOM DRAG] Could not access parent setAncestryTask');
        this.set('isSettingAncestry', false);
        this.set('isMovingContainer', false);
      }
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
      
      // Create a new array with the question moved to the target position
      let itemsCopy = items.slice();
      const draggedItem = itemsCopy.splice(currentIndex, 1)[0];
      itemsCopy.splice(targetIndex, 0, draggedItem);
      
      console.log('[CUSTOM DRAG] Items after move:', itemsCopy.map((item, index) => `${index}: ${item.get('questionText')} (parentId: ${item.get('parentId')})`));
      
      // Use parent's updateSortOrderTask to persist the changes to database
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('updateSortOrderTask')) {
        console.log('[CUSTOM DRAG] Using parent updateSortOrderTask to persist sort order changes');
        
        // Check if this is a placement modal move (above/below) where we've already handled children
        const isPlacementModalMove = this.get('isMovingContainer') || this.get('isSettingAncestry');
        
        // If this is a container, ensure children are properly positioned (but skip if we've already handled them)
        const isContainer = draggedItem.get('isARepeater') || draggedItem.get('isContainer');
        if (isContainer && !isPlacementModalMove) {
          console.log('[CUSTOM DRAG] Container moved via direct drag, ensuring children are properly positioned');
          itemsCopy = this.reorderContainerWithChildren(itemsCopy, draggedItem);
        } else if (isContainer && isPlacementModalMove) {
          console.log('[CUSTOM DRAG] Container moved via placement modal, skipping reorderContainerWithChildren (children already handled)');
        }
        
        // Call updateSortOrderTask with reSort=false to use our array order
        parentComponent.get('updateSortOrderTask').perform(itemsCopy, false).then(() => {
          console.log('[CUSTOM DRAG] updateSortOrderTask completed successfully');
          
          // Force a UI refresh to ensure the changes are visible
          parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true).then(() => {
            console.log('[CUSTOM DRAG] UI refresh completed');
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error refreshing UI:', error);
          });
        }).catch((error) => {
          console.error('[CUSTOM DRAG] Error in updateSortOrderTask:', error);
        });
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
    const timeout = run.scheduleOnce('afterRender', this, () => {
      const items = this.element.querySelectorAll('.sortable-item');
      const selectedItem = this.get('selectedItem');
      console.log('[CUSTOM DRAG] Creating drop zones for', items.length, 'items');
      
      if (!selectedItem) {
        console.log('[CUSTOM DRAG] No selected item, skipping drop zone creation');
        return;
      }
      
      // Check if survey template is locked - don't add selection handlers if not fully editable
      const isFullyEditable = this.get('isFullyEditable');
      
      if (isFullyEditable) {
        // Add click handlers to all items for selection
        items.forEach((element, index) => {
          // Add click handler only to the move icon (glyphicons-sorting)
          const moveIcon = element.querySelector('.glyphicons-sorting');
          if (moveIcon) {
            const selectionClickHandler = (event) => {
              console.log('[CUSTOM DRAG] Move icon clicked for selection at index:', index);
              
              const questionElement = element.querySelector('[data-question-id]');
              if (questionElement) {
                const questionId = questionElement.getAttribute('data-question-id');
                const question = this.get('items').findBy('id', questionId);
                if (question) {
                  console.log('[CUSTOM DRAG] Calling selectItem for question:', question.get('questionText'));
                  this.send('selectItem', question, index);
                }
              }
            };
            
            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(moveIcon, 'click', selectionClickHandler);
            console.log('[CUSTOM DRAG] Added selection click handler to move icon for item at index:', index);
          }
        });
      } else {
        console.log('[CUSTOM DRAG] Survey template is not fully editable, skipping selection handlers');
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
            
            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(element, 'click', clickHandler);
            
            // Add mouse enter/leave for visual feedback
            const enterHandler = () => this.highlightContainerDropZone(element);
            const leaveHandler = () => this.unhighlightContainerDropZone(element);
            
            this.safeAddEventListener(element, 'mouseenter', enterHandler);
            this.safeAddEventListener(element, 'mouseleave', leaveHandler);
            
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
            
            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(element, 'click', clickHandler);
            
            // Add mouse enter/leave for visual feedback
            const enterHandler = () => this.highlightDropZone(element);
            const leaveHandler = () => this.unhighlightDropZone(element);
            
            this.safeAddEventListener(element, 'mouseenter', enterHandler);
            this.safeAddEventListener(element, 'mouseleave', leaveHandler);
            
            console.log('[CUSTOM DRAG] Added blue drop zone for regular positioning at index:', index);
          } else {
            console.log('[CUSTOM DRAG] No drop zone added for index:', index, 'question:', question ? question.get('questionText') : 'unknown');
          }
        }
      });
    });
    
    // Register timeout for cleanup
    this.registerTimeout(timeout, 'dropZone');
  },
  
  removeDropZones() {
    const items = this.element.querySelectorAll('.sortable-item');
    console.log('[CUSTOM DRAG] Removing drop zones');
    
    items.forEach(element => {
      element.classList.remove('drop-zone-active', 'drop-zone-highlighted', 'container-drop-zone-active', 'container-drop-zone-highlighted');
      
      // Remove only drop zone related event listeners from this element
      const listeners = this.get('activeEventListeners');
      const elementListeners = listeners.filter(({ element: el, event }) => {
        // Keep selection handlers (click on move icons), remove drop zone handlers
        const isSelectionHandler = event === 'click' && el.classList.contains('glyphicons-sorting');
        const isDropZoneHandler = event === 'click' || event === 'mouseenter' || event === 'mouseleave';
        return el === element && isDropZoneHandler && !isSelectionHandler;
      });
      
      elementListeners.forEach(({ element: el, event, handler }) => {
        this.safeRemoveEventListener(el, event, handler);
      });
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

  highlightChildren(container) {
    console.log('[CUSTOM DRAG] Highlighting children for container:', container.get('questionText'));
    
    const items = this.get('items');
    const containerId = container.get('id');
    
    // Recursively find ALL descendants of this container
    const allDescendants = this.getAllDescendants(containerId, items);
    
    console.log('[CUSTOM DRAG] Found', allDescendants.length, 'descendants to highlight');
    console.log('[CUSTOM DRAG] Descendants:', allDescendants.map(d => ({
      id: d.get('id'),
      text: d.get('questionText'),
      parentId: d.get('parentId')
    })));
    
    if (allDescendants.length === 0) {
      console.log('[CUSTOM DRAG] No descendants to highlight');
      return;
    }
    
    // Use run.scheduleOnce to ensure DOM is ready
    run.scheduleOnce('afterRender', this, () => {
      console.log('[CUSTOM DRAG] DOM ready, starting highlight process');
      
      // Create a Set of descendant IDs for faster lookup
      const descendantIds = new Set(allDescendants.map(descendant => descendant.get('id').toString()));
      console.log('[CUSTOM DRAG] Looking for descendant IDs:', Array.from(descendantIds));
      
      // Find all sortable-item elements once
      const descendantElements = this.element.querySelectorAll('.sortable-item');
      console.log('[CUSTOM DRAG] Found', descendantElements.length, 'sortable-item elements in DOM');
      
      let highlightedCount = 0;
      
      // Process each element efficiently
      descendantElements.forEach((element, index) => {
        const questionElement = element.querySelector('[data-question-id]');
        if (questionElement) {
          const questionId = questionElement.getAttribute('data-question-id');
          console.log('[CUSTOM DRAG] Element', index, 'has question ID:', questionId);
          
          if (descendantIds.has(questionId)) {
            element.classList.add('children-highlight');
            highlightedCount++;
            console.log('[CUSTOM DRAG] Added children-highlight class to element with question ID:', questionId);
          }
        } else {
          console.log('[CUSTOM DRAG] Element', index, 'has no data-question-id attribute');
        }
      });
      
      console.log('[CUSTOM DRAG] Highlighted', highlightedCount, 'out of', allDescendants.length, 'expected descendants');
    });
  },

  // Helper method to recursively find all descendants of a container
  getAllDescendants(containerId, items) {
    const descendants = [];
    
    // Find direct children
    const directChildren = items.filter(item => item.get('parentId') === containerId);
    descendants.push(...directChildren);
    
    // Recursively find children of children
    directChildren.forEach(child => {
      const childDescendants = this.getAllDescendants(child.get('id'), items);
      descendants.push(...childDescendants);
    });
    
    return descendants;
  },

  removeChildrenHighlight() {
    // Use run.scheduleOnce to ensure DOM is ready
    const timeout = run.scheduleOnce('afterRender', this, () => {
      // Remove highlight from all elements
      const elements = this.element.querySelectorAll('.children-highlight');
      elements.forEach(element => {
        element.classList.remove('children-highlight');
      });
    });
    
    // Register timeout for cleanup
    this.registerTimeout(timeout, 'childrenHighlight');
  },

  // Helper method to safely remove event listeners and prevent duplicates
  safeRemoveEventListener(element, event, handler) {
    if (element && element.removeEventListener) {
      element.removeEventListener(event, handler);
    }
    
    // Remove from activeEventListeners array
    const listeners = this.get('activeEventListeners');
    const index = listeners.findIndex(({ element: el, event: evt, handler: hdlr }) => 
      el === element && evt === event && hdlr === handler
    );
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },

  // Helper method to safely add event listeners and prevent duplicates
  safeAddEventListener(element, event, handler) {
    console.log('[CUSTOM DRAG] safeAddEventListener called for:', { event, elementClass: element.className });
    
    // Check if this exact listener already exists
    const existingListener = this.get('activeEventListeners').find(({ element: el, event: evt, handler: hdlr }) => 
      el === element && evt === event && hdlr === handler
    );
    
    if (existingListener) {
      console.log('[CUSTOM DRAG] Listener already exists, skipping add');
      return;
    }
    
    // Check if there's any listener for this element/event combination
    const existingElementListener = this.get('activeEventListeners').find(({ element: el, event: evt }) => 
      el === element && evt === event
    );
    
    if (existingElementListener) {
      console.log('[CUSTOM DRAG] Removing existing listener for same element/event before adding new one');
      this.safeRemoveEventListener(existingElementListener.element, existingElementListener.event, existingElementListener.handler);
    }
    
    // Add new listener
    element.addEventListener(event, handler);
    this.get('activeEventListeners').push({ element, event, handler });
    
    console.log('[CUSTOM DRAG] Added listener, total activeEventListeners:', this.get('activeEventListeners').length);
  },

  // Helper method to register timeouts for cleanup with deduplication
  registerTimeout(timeout, timeoutType = 'general') {
    // Cancel existing timeout of the same type if it exists
    const existingTimeout = this.get(`_${timeoutType}Timeout`);
    if (existingTimeout) {
      run.cancel(existingTimeout);
    }
    
    // Store the new timeout
    this.set(`_${timeoutType}Timeout`, timeout);
    this.get('cleanupTimeouts').push(timeout);
  },

  // Helper method to register event listeners for cleanup
  registerEventListener(element, event, handler) {
    this.safeAddEventListener(element, event, handler);
  },

  // Ensure selection is cleared when component updates
  didUpdate() {
    this._super(...arguments);
    
    // Check if survey template is locked - clear selection if not fully editable
    const isFullyEditable = this.get('isFullyEditable');
    
    if (!isFullyEditable && this.get('selectedItem')) {
      console.log('[CUSTOM DRAG] Survey template is not fully editable, clearing existing selection');
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
      this.removeChildrenHighlight();
      this.cleanupAfterMove();
      return; // Don't proceed with other updates when locked
    }
    
    // Periodic cleanup check to prevent listener accumulation
    if (this.get('activeEventListeners').length > 20) {
      console.warn('[CUSTOM DRAG] High listener count detected in didUpdate, performing cleanup');
      this.cleanupAfterMove();
    }
    
    // If we have a selected item but it's no longer in the items array, clear selection
    const selectedItem = this.get('selectedItem');
    const items = this.get('items');
    
    if (selectedItem) {
      // Check if the selected item is still in the items array
      const itemStillExists = items.findBy('id', selectedItem.get('id'));
      
      if (!itemStillExists) {
        console.log('[CUSTOM DRAG] Selected item no longer in items array, clearing selection');
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
        this.removeChildrenHighlight();
        this.cleanupAfterMove();
      } else {
        // Update the selectedIndex to match the current position
        const currentIndex = items.indexOf(itemStillExists);
        if (currentIndex !== this.get('selectedIndex')) {
          console.log('[CUSTOM DRAG] Selected item index changed from', this.get('selectedIndex'), 'to', currentIndex);
          this.set('selectedIndex', currentIndex);
        }
      }
    }
    
    // Ensure selection handlers are always available
    this.ensureSelectionHandlers();
    
    // If we have a selected item, ensure drop zones are maintained after DOM updates
    if (selectedItem) {
      run.scheduleOnce('afterRender', this, () => {
        console.log('[CUSTOM DRAG] DOM updated, ensuring drop zones are maintained');
        this.createDropZones();
      });
    }
  },

  // Ensure selection click handlers are always available
  ensureSelectionHandlers() {
    run.scheduleOnce('afterRender', this, () => {
      // Check if survey template is locked - don't add selection handlers if not fully editable
      const isFullyEditable = this.get('isFullyEditable');
      
      if (!isFullyEditable) {
        console.log('[CUSTOM DRAG] Survey template is not fully editable, skipping selection handlers in ensureSelectionHandlers');
        return;
      }
      
      const items = this.element.querySelectorAll('.sortable-item');
      console.log('[CUSTOM DRAG] Ensuring selection handlers for', items.length, 'items');
      
      let addedCount = 0;
      let skippedCount = 0;
      
      items.forEach((element, index) => {
        // Add click handler only to the move icon (glyphicons-sorting)
        const moveIcon = element.querySelector('.glyphicons-sorting');
        if (moveIcon) {
          // Check if handler already exists to prevent duplicates
          const existingHandler = this.get('activeEventListeners').find(({ element: el, event }) => 
            el === moveIcon && event === 'click'
          );
          
          if (!existingHandler) {
            const selectionClickHandler = (event) => {
              console.log('[CUSTOM DRAG] Move icon clicked for selection at index:', index);
              
              const questionElement = element.querySelector('[data-question-id]');
              if (questionElement) {
                const questionId = questionElement.getAttribute('data-question-id');
                const question = this.get('items').findBy('id', questionId);
                if (question) {
                  console.log('[CUSTOM DRAG] Calling selectItem for question:', question.get('questionText'));
                  this.send('selectItem', question, index);
                }
              }
            };
            
            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(moveIcon, 'click', selectionClickHandler);
            console.log('[CUSTOM DRAG] Added selection click handler to move icon for item at index:', index);
            addedCount++;
          } else {
            console.log('[CUSTOM DRAG] Selection handler already exists for item at index:', index);
            skippedCount++;
          }
        } else {
          console.log('[CUSTOM DRAG] No move icon found for item at index:', index);
        }
      });
      
      console.log('[CUSTOM DRAG] Selection handlers summary - Added:', addedCount, 'Skipped:', skippedCount, 'Total activeEventListeners:', this.get('activeEventListeners').length);
      
      // Display listener count warning if high
      const listenerCount = this.get('activeEventListeners').length;
      if (listenerCount > 15) {
        console.warn(`[CUSTOM DRAG] WARNING: High listener count: ${listenerCount}. Consider refreshing the page.`);
      }
      
      // If we have a selected item, ensure drop zones are recreated
      if (this.get('selectedItem')) {
        console.log('[CUSTOM DRAG] Selected item exists, recreating drop zones');
        this.createDropZones();
      }
    });
  },

  // Comprehensive cleanup method called after every move operation
  cleanupAfterMove() {
    console.log('[CUSTOM DRAG] Performing comprehensive cleanup after move');
    console.log('[CUSTOM DRAG] Before cleanup - activeEventListeners:', this.get('activeEventListeners').length, 'cleanupTimeouts:', this.get('cleanupTimeouts').length);
    
    // Emergency cleanup if we have too many listeners
    if (this.get('activeEventListeners').length > 50) {
      console.warn('[CUSTOM DRAG] EMERGENCY: Too many event listeners detected, performing aggressive cleanup');
      this.get('activeEventListeners').forEach(({ element, event, handler }) => {
        if (element && element.removeEventListener) {
          element.removeEventListener(event, handler);
        }
      });
      this.set('activeEventListeners', []);
      console.log('[CUSTOM DRAG] Emergency cleanup completed');
    }
    
    // Cancel all registered timeouts
    this.get('cleanupTimeouts').forEach(timeout => {
      if (timeout) {
        run.cancel(timeout);
      }
    });
    this.set('cleanupTimeouts', []);
    
    // Clear specific timeout references
    this.set('_highlightTimeout', null);
    this.set('_dropZoneTimeout', null);
    this.set('_selectionTimeout', null);
    this.set('_childrenHighlightTimeout', null);
    
    // Remove only drop zone and highlight related event listeners
    const listeners = this.get('activeEventListeners');
    const listenersToRemove = listeners.filter(({ element, event }) => {
      // Keep selection handlers (click on move icons), remove drop zone handlers
      const isSelectionHandler = event === 'click' && element.classList.contains('glyphicons-sorting');
      const isDropZoneHandler = event === 'click' || event === 'mouseenter' || event === 'mouseleave';
      const shouldRemove = isDropZoneHandler && !isSelectionHandler;
      
      if (shouldRemove) {
        console.log('[CUSTOM DRAG] Removing listener:', { event, elementClass: element.className });
      } else {
        console.log('[CUSTOM DRAG] Keeping listener:', { event, elementClass: element.className });
      }
      
      return shouldRemove;
    });
    
    console.log('[CUSTOM DRAG] Removing', listenersToRemove.length, 'drop zone listeners, keeping', listeners.length - listenersToRemove.length, 'selection listeners');
    
    listenersToRemove.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler);
      }
    });
    
    // Remove the filtered listeners from tracking array
    this.set('activeEventListeners', listeners.filter(listener => 
      !listenersToRemove.includes(listener)
    ));
    
    // Remove all drop zones and highlights
    this.removeDropZones();
    this.removeChildrenHighlight();
    
    // Clear any remaining DOM classes
    if (this.element) {
      const items = this.element.querySelectorAll('.sortable-item');
      items.forEach(element => {
        element.classList.remove(
          'drop-zone-active', 
          'drop-zone-highlighted', 
          'container-drop-zone-active', 
          'container-drop-zone-highlighted',
          'children-highlight'
        );
      });
    }
    
    // Re-add selection handlers after cleanup
    run.scheduleOnce('afterRender', this, () => {
      console.log('[CUSTOM DRAG] Re-adding selection handlers after cleanup');
      this.ensureSelectionHandlers();
    });
    
    console.log('[CUSTOM DRAG] Cleanup completed - activeEventListeners:', this.get('activeEventListeners').length, 'cleanupTimeouts:', this.get('cleanupTimeouts').length);
  },

  // Clean up timeouts when component is destroyed
  willDestroyElement() {
    // Use comprehensive cleanup method
    this.cleanupAfterMove();
    
    // Clear any remaining timeout references
    this.set('_highlightTimeout', null);
    this.set('_dropZoneTimeout', null);
    this.set('_selectionTimeout', null);
    this.set('_childrenHighlightTimeout', null);
    
    this._super(...arguments);
  },

  // Force a complete refresh of the component
  forceRefresh() {
    console.log('[CUSTOM DRAG] Forcing complete component refresh');
    
    // Clear selection
    this.set('selectedItem', null);
    this.set('selectedIndex', -1);
    this.removeDropZones();
    this.removeChildrenHighlight();
    
    // Force a re-render by triggering a property change
    run.scheduleOnce('afterRender', this, () => {
      const currentItems = this.get('items');
      this.set('items', currentItems.slice()); // Force a new array reference
      
      // Re-add selection handlers
      this.ensureSelectionHandlers();
      
      // Log the current state after refresh
      console.log('[CUSTOM DRAG] After force refresh - items count:', currentItems.length);
      currentItems.forEach((item, index) => {
        console.log(`[CUSTOM DRAG] Item ${index}:`, item.get('questionText'), 'parentId:', item.get('parentId'));
      });
    });
  },

  // Check if UI reflects the data changes
  checkUIState() {
    console.log('[CUSTOM DRAG] Checking UI state');
    const items = this.get('items');
    const domItems = this.element.querySelectorAll('.sortable-item');
    
    console.log('[CUSTOM DRAG] Data items count:', items.length);
    console.log('[CUSTOM DRAG] DOM items count:', domItems.length);
    
    items.forEach((item, index) => {
      console.log(`[CUSTOM DRAG] Data item ${index}:`, item.get('questionText'), 'parentId:', item.get('parentId'));
    });
    
    domItems.forEach((element, index) => {
      const questionElement = element.querySelector('[data-question-id]');
      if (questionElement) {
        const questionId = questionElement.getAttribute('data-question-id');
        console.log(`[CUSTOM DRAG] DOM item ${index}: questionId:`, questionId);
      }
    });
  },

  // Reorder items array to ensure container and its children are properly positioned
  reorderContainerWithChildren(items, container) {
    console.log('[CUSTOM DRAG] Reordering container with children:', container.get('questionText'));
    
    const containerId = container.get('id');
    const containerIndex = items.indexOf(container);
    
    if (containerIndex === -1) {
      console.log('[CUSTOM DRAG] Container not found in items array');
      return items;
    }
    
    // Find all children of this container
    const children = items.filter(item => item.get('parentId') === containerId);
    console.log('[CUSTOM DRAG] Found', children.length, 'children for container');
    
    if (children.length === 0) {
      console.log('[CUSTOM DRAG] No children to reorder');
      return items;
    }
    
    // Create a new array with container and children properly positioned
    const reorderedItems = [];
    const processedItems = new Set();
    
    // Add all items before the container
    for (let i = 0; i < containerIndex; i++) {
      const item = items[i];
      if (item.get('parentId') !== containerId) { // Don't include children yet
        reorderedItems.push(item);
        processedItems.add(item.get('id'));
      }
    }
    
    // Add the container
    reorderedItems.push(container);
    processedItems.add(container.get('id'));
    
    // Add all children of this container
    children.forEach(child => {
      reorderedItems.push(child);
      processedItems.add(child.get('id'));
    });
    
    // Add all remaining items
    for (let i = containerIndex + 1; i < items.length; i++) {
      const item = items[i];
      if (!processedItems.has(item.get('id'))) {
        reorderedItems.push(item);
      }
    }
    
    console.log('[CUSTOM DRAG] Reordered items array - container at index:', reorderedItems.indexOf(container));
    console.log('[CUSTOM DRAG] Children positioned after container');
    
    return reorderedItems;
  },

  /**
   * Recursively update ancestry and sortOrder for all descendants of a container.
   * @param {Object} parent - The parent question (container)
   * @param {String} parentId - The new parentId for direct children
   * @param {Number} startSortOrder - The sortOrder to start from (for the first child)
   * @param {Array} allQuestions - The full list of questions
   * @returns {Promise} Resolves when all descendants are updated
   */
  updateSubtreeAncestryAndSortOrder(parent, parentId, startSortOrder, allQuestions) {
    return new Promise((resolve, reject) => {
      let sortOrder = startSortOrder;
      // Find direct children of this parent
      let children = allQuestions.filter(q => q.get('parentId') === parent.get('id'));
      // Sort children by their old sortOrder to preserve their relative order
      children = children.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
      
      console.log('[CUSTOM DRAG] [RECURSIVE] Found', children.length, 'children for parent:', parent.get('questionText'));
      
      if (children.length === 0) {
        resolve(sortOrder);
        return;
      }
      
      // Process children sequentially
      let processChild = (index) => {
        if (index >= children.length) {
          resolve(sortOrder);
          return;
        }
        
        let child = children[index];
        child.set('parentId', parentId);
        child.set('sortOrder', sortOrder);
        console.log('[CUSTOM DRAG] [RECURSIVE] Setting', child.get('questionText'), 'parentId to', parentId, 'sortOrder to', sortOrder);
        
        child.save().then(() => {
          return child.reload();
        }).then(() => {
          // Recursively update this child's descendants
          return this.updateSubtreeAncestryAndSortOrder(child, child.get('id'), sortOrder + 0.001, allQuestions);
        }).then((newSortOrder) => {
          sortOrder = newSortOrder;
          processChild(index + 1);
        }).catch((error) => {
          console.error('[CUSTOM DRAG] [RECURSIVE] Error processing child:', error);
          reject(error);
        });
      };
      
      processChild(0);
    });
  }
}); 