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
  placementType: 'container', // 'container' or 'question'
  highlightTimeout: null,
  cleanupTimeouts: [],
  activeEventListeners: [],
  isMovingContainer: false, // Flag to prevent UI refresh during container moves

  actions: {
    selectItem(item, index) {
      // Check if survey template is locked - prevent selection if not fully editable
      const isFullyEditable = this.get('isFullyEditable');
      if (!isFullyEditable) {
        return;
      }

      // Check if item is in the current items array
      const items = this.get('items');
      const itemInArray = items.findBy('id', item.get('id'));

      if (this.get('selectedItem') === item) {
        // Deselect if clicking the same item
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
        this.removeChildrenHighlight();
        this.cleanupAfterMove();
      } else {
        // Select new item

        // Clean up before selecting new item
        this.cleanupAfterMove();

        this.set('selectedItem', item);
        this.set('selectedIndex', index);
        
        // Show timed prompt
        this.showMovePrompt();
        
        this.createDropZones();

        // Only highlight children if this is a container
        const isContainer = item.get('isARepeater') || item.get('isContainer');
        if (isContainer) {
          // Debounce highlighting to prevent performance issues
          const timeout = run.later(
            this,
            () => {
              this.highlightChildren(item);
            },
            100
          ); // Increased delay for better debouncing

          this.registerTimeout(timeout, 'highlight');
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
        console.log(
          '[CUSTOM DRAG] Showing placement modal for container repositioning:',
          questionName,
          'and container:',
          containerName
        );
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

      console.log(
        '[CUSTOM DRAG] Container levels - selected:',
        selectedContainerLevel,
        'target:',
        targetContainerLevel
      );

      // ENFORCE TWO-LEVEL MAXIMUM NESTING RULE
      // Prevent creating more than two levels of nesting
      
      // Check if this move would violate the two-level rule
      if (selectedContainerLevel === 2 && targetContainerLevel === 2) {
        // Moving from Level 2 to Level 2 - check if they're in the same Level 1 container
        const selectedLevel1Container = items.findBy('id', selectedParentId);
        const targetLevel1Container = items.findBy('id', containerParentId);

        if (
          selectedLevel1Container &&
          targetLevel1Container &&
          selectedLevel1Container.get('id') !== targetLevel1Container.get('id')
        ) {
          console.log('[CUSTOM DRAG] Cannot move from Level 2 to Level 2 in different Level 1 containers');
          // Show error message or prevent the move
          return;
        }
      }
      
      // NEW: Prevent moving items into Level 2 containers (would create Level 3 nesting)
      if (targetContainerLevel === 2) {
        console.log('[CUSTOM DRAG] Cannot move into Level 2 container - would create more than two levels of nesting');
        // Show error message or prevent the move
        return;
      }
      
      // NEW: Prevent moving containers that are already at Level 1 into other containers
      // This would create Level 2 nesting which is not allowed for containers
      if (selectedIsContainer && selectedContainerLevel === 1 && targetContainerLevel === 1) {
        console.log('[CUSTOM DRAG] Cannot move Level 1 container into another Level 1 container - would create Level 2 nesting');
        // Show error message or prevent the move
        return;
      }

      // Show placement options modal directly
      const questionName = selectedItem.get('questionText');
      const containerName = containerQuestion.get('questionText');
      console.log('[CUSTOM DRAG] Showing placement modal for:', questionName, 'and container:', containerName);

      this.send('showPlacementModal', selectedItem, containerQuestion);
    },

    showPlacementModal(question, target, placementType = 'container') {
      console.log(
        '[CUSTOM DRAG] Showing placement modal for:',
        question.get('questionText'),
        'and target:',
        target.get('questionText'),
        'type:',
        placementType
      );
      this.set('showPlacementOptions', true);
      this.set('placementQuestion', question);
      this.set('placementContainer', target);
      this.set('placementType', placementType); // 'container' or 'question'
    },

    hidePlacementModal() {
      this.set('showPlacementOptions', false);
      this.set('placementQuestion', null);
      this.set('placementContainer', null);
      this.set('placementType', 'container');

      // Clear selection
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
    },

    placeInsideTop() {
      const question = this.get('placementQuestion');
      const container = this.get('placementContainer');

      if (!question || !container) return;

      console.log(
        '[CUSTOM DRAG] Placing',
        question.get('questionText'),
        'INSIDE TOP of',
        container.get('questionText')
      );

      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);

      // Check if the question being moved is a container with children
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      const items = this.get('items');
      const children = isContainer ? items.filter((item) => item.get('parentId') === question.get('id')) : [];

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
          this.set('placementType', 'inside-top'); // Set the placement type for proper descendant positioning

          // Store the children BEFORE any moves happen, sorted by their current sortOrder
          const items = this.get('items');
          const containerId = question.get('id');
          const allChildren = items.filter((item) => item.get('parentId') === containerId);
          // Sort children by their current sortOrder to preserve their intended order
          const childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
          console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move');
          console.log(
            '[CUSTOM DRAG] Children before move (sorted by sortOrder):',
            childrenBeforeMove.map((c) => ({
              id: c.get('id'),
              text: c.get('questionText'),
              parentId: c.get('parentId'),
              sortOrder: c.get('sortOrder')
            }))
          );

          // Step 1: Move the container and save it (INSIDE TOP - place before first child)
          const targetContainerId = container.get('id');

          // Find the first child of the container to place before it
          const containerChildren = items.filter((item) => item.get('parentId') === targetContainerId);
          let newSortOrder;

          if (containerChildren.length > 0) {
            // Find the minimum sortOrder among existing children and place before it
            const minChildSortOrder = Math.min(...containerChildren.map((child) => child.get('sortOrder')));
            newSortOrder = minChildSortOrder;
            console.log(
              '[CUSTOM DRAG] Placing container before first child with sortOrder:',
              newSortOrder,
              '(min child sortOrder was:',
              minChildSortOrder,
              ')'
            );
          } else {
            // No children, use container's sortOrder + 1
            newSortOrder = container.get('sortOrder') + 1;
            console.log('[CUSTOM DRAG] No children, placing container after container with sortOrder:', newSortOrder);
          }

          // Set parentId to make it a child of the container
          question.set('parentId', targetContainerId);
          question.set('sortOrder', newSortOrder);

          console.log('[CUSTOM DRAG] Set parentId to container and sortOrder to:', newSortOrder);

          question
            .save()
            .then(() => {
              console.log('[CUSTOM DRAG] Step 1: Container moved and saved (INSIDE TOP)');
              console.log(
                '[CUSTOM DRAG] Container after move - parentId:',
                question.get('parentId'),
                'sortOrder:',
                question.get('sortOrder')
              );

              // Step 2: Reload the container to ensure we have fresh data
              question
                .reload()
                .then(() => {
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

                    // Find the first child of the target container to insert before it
                    const targetContainerChildren = fullQuestions.filter(
                      (q) => q.get('parentId') === container.get('id')
                    );
                    let insertIndex;

                    if (targetContainerChildren.length > 0) {
                      // Find the first child's position in the array
                      const firstChild = targetContainerChildren[0];
                      const firstChildIndex = fullQuestions.indexOf(firstChild);
                      insertIndex = firstChildIndex;
                      console.log('[CUSTOM DRAG] Inserting container before first child at index:', insertIndex);
                    } else {
                      // No children, insert right after the target container
                      insertIndex = targetContainerIndex + 1;
                      console.log(
                        '[CUSTOM DRAG] No children, inserting container after target container at index:',
                        insertIndex
                      );
                    }

                    fullQuestions.insertAt(insertIndex, question);
                    console.log('[CUSTOM DRAG] Inserted container at index:', insertIndex);
                  }

                  // Step 3: Update children ancestry BEFORE any UI refresh
                  this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
                })
                .catch((error) => {
                  console.error('[CUSTOM DRAG] Error in Step 2 (container reload):', error);
                  this.set('isSettingAncestry', false);
                  this.set('isMovingContainer', false);
                  this.cleanupAfterMove();
                });
            })
            .catch((error) => {
              console.error('[CUSTOM DRAG] Error in Step 1 (container save):', error);
              this.set('isSettingAncestry', false);
              this.set('isMovingContainer', false);
              this.cleanupAfterMove();
            });
        } else {
          // For non-containers, manually set ancestry and sort order for INSIDE TOP placement
          console.log('[CUSTOM DRAG] Using manual ancestry setting for single question (INSIDE TOP)');
          this.set('placementType', 'inside-top'); // Set the placement type for consistency

          // Ensure the container is expanded so the placed item will be visible
          if (container.get('collapsed')) {
            console.log('[CUSTOM DRAG] Container is collapsed, expanding it');
            const collapsible = parentComponent.get('collapsible');
            if (collapsible) {
              collapsible.toggleCollapsed(container);
            }
          }

          // Find the first child of the container to place before it
          const containerChildren = items.filter((item) => item.get('parentId') === container.get('id'));
          let newSortOrder;

          if (containerChildren.length > 0) {
            // Find the minimum sortOrder among existing children and place before it
            const minChildSortOrder = Math.min(...containerChildren.map((child) => child.get('sortOrder')));
            newSortOrder = minChildSortOrder;
            console.log(
              '[CUSTOM DRAG] Placing single question before first child with sortOrder:',
              newSortOrder,
              '(min child sortOrder was:',
              minChildSortOrder,
              ')'
            );
          } else {
            // No children, use container's sortOrder + 1
            newSortOrder = container.get('sortOrder') + 1;
            console.log(
              '[CUSTOM DRAG] No children, placing single question after container with sortOrder:',
              newSortOrder
            );
          }

          // Set parentId to make it a child of the container
          question.set('parentId', container.get('id'));
          question.set('sortOrder', newSortOrder);

          console.log('[CUSTOM DRAG] Set parentId to container and sortOrder to:', newSortOrder);

          question
            .save()
            .then(() => {
              console.log('[CUSTOM DRAG] Single question moved and saved (INSIDE TOP)');
              console.log(
                '[CUSTOM DRAG] Question after move - parentId:',
                question.get('parentId'),
                'sortOrder:',
                question.get('sortOrder')
              );

              // Reload the question to ensure we have fresh data
              question
                .reload()
                .then(() => {
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
                    const containerChildren = fullQuestions.filter((q) => q.get('parentId') === container.get('id'));
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
                      console.log(
                        '[CUSTOM DRAG] No children, inserting question after container at index:',
                        insertIndex
                      );
                    }

                    fullQuestions.insertAt(insertIndex, question);
                    console.log('[CUSTOM DRAG] Inserted question at index:', insertIndex);
                  }

                  // For inside top placement, we need to call updateSortOrderTask to normalize sortOrders
                  // but we need to ensure the question stays as the first child
                  console.log(
                    '[CUSTOM DRAG] Calling updateSortOrderTask for inside top placement with integer sortOrders'
                  );
                  console.log(
                    '[CUSTOM DRAG] Array order before updateSortOrderTask:',
                    fullQuestions.map((q, i) => ({
                      index: i,
                      id: q.get('id'),
                      text: q.get('questionText'),
                      parentId: q.get('parentId'),
                      sortOrder: q.get('sortOrder')
                    }))
                  );

                  parentComponent
                    .get('updateSortOrderTask')
                    .perform(fullQuestions, false)
                    .then(() => {
                      console.log('[CUSTOM DRAG] UI refreshed after inside top placement');
                      console.log(
                        '[CUSTOM DRAG] Final array order after updateSortOrderTask:',
                        fullQuestions.map((q, i) => ({
                          index: i,
                          id: q.get('id'),
                          text: q.get('questionText'),
                          parentId: q.get('parentId'),
                          sortOrder: q.get('sortOrder')
                        }))
                      );
                      this.set('isSettingAncestry', false);
                      this.cleanupAfterMove();
                    })
                    .catch((error) => {
                      console.error('[CUSTOM DRAG] Error refreshing UI:', error);
                      this.set('isSettingAncestry', false);
                      this.cleanupAfterMove();
                    });
                })
                .catch((error) => {
                  console.error('[CUSTOM DRAG] Error reloading single question:', error);
                  this.set('isSettingAncestry', false);
                  this.cleanupAfterMove();
                });
            })
            .catch((error) => {
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
      const targetIndex = containerIndex; // For "ABOVE", we place at the target container's position, which pushes it down
      console.log('[CUSTOM DRAG] Target position calculated:', targetIndex, 'for container at index:', containerIndex);

      // Store targetIndex and placement type for use in children update
      this.set('targetIndex', targetIndex);
      this.set('placementType', 'above');

      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);

      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const items = this.get('items');
        const containerId = question.get('id');
        const allChildren = items.filter((item) => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for above/below placement');
        console.log(
          '[CUSTOM DRAG] Children before move (sorted by sortOrder):',
          childrenBeforeMove.map((c) => ({
            id: c.get('id'),
            text: c.get('questionText'),
            parentId: c.get('parentId'),
            sortOrder: c.get('sortOrder')
          }))
        );
      }

      // Clear ancestry and save
      const containerParentId = container.get('parentId');
      const oldParentId = question.get('parentId');
      console.log(
        '[CUSTOM DRAG] Setting ancestry from parentId:',
        oldParentId,
        'to container parentId:',
        containerParentId
      );

      question.set('parentId', containerParentId);

      // Save the question to persist the ancestry change
      question
        .save()
        .then(() => {
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

                // First, actually move the container to the target position
                const currentIndex = items.indexOf(question);
                if (currentIndex !== -1 && currentIndex !== targetIndex) {
                  console.log('[CUSTOM DRAG] Moving container from index', currentIndex, 'to index', targetIndex);
                  items.removeAt(currentIndex);
                  // Adjust target index if we removed an item before the target position
                  let adjustedTargetIndex = targetIndex;
                  if (currentIndex < targetIndex) {
                    adjustedTargetIndex = targetIndex - 1;
                    console.log(
                      '[CUSTOM DRAG] Adjusted target index from',
                      targetIndex,
                      'to',
                      adjustedTargetIndex,
                      'due to removal'
                    );
                  }
                  items.insertAt(adjustedTargetIndex, question);
                }

                this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
              } else {
                // For non-containers, use moveQuestionToPosition to handle the positioning
                this.send('moveQuestionToPosition', question, targetIndex);
              }
            });
          });
        })
        .catch((error) => {
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
      console.log(
        '[CUSTOM DRAG] Looking for children of container:',
        container.get('questionText'),
        'with ID:',
        containerId
      );
      for (let i = containerIndex + 1; i < items.length; i++) {
        const item = items.objectAt(i);
        console.log(
          '[CUSTOM DRAG] Checking item at index',
          i,
          ':',
          item.get('questionText'),
          'parentId:',
          item.get('parentId')
        );

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

      // Store targetIndex and placement type for use in children update
      this.set('targetIndex', targetIndex);
      this.set('placementType', 'below');

      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);

      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const containerId = question.get('id');
        const allChildren = items.filter((item) => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for below placement');
        console.log(
          '[CUSTOM DRAG] Children before move (sorted by sortOrder):',
          childrenBeforeMove.map((c) => ({
            id: c.get('id'),
            text: c.get('questionText'),
            parentId: c.get('parentId'),
            sortOrder: c.get('sortOrder')
          }))
        );
      }

      // Clear ancestry and save
      const containerParentId = container.get('parentId');
      const oldParentId = question.get('parentId');
      console.log(
        '[CUSTOM DRAG] Setting ancestry from parentId:',
        oldParentId,
        'to container parentId:',
        containerParentId
      );

      question.set('parentId', containerParentId);

      // Save the question to persist the ancestry change
      question
        .save()
        .then(() => {
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

                // First, actually move the container to the target position
                const currentIndex = items.indexOf(question);
                if (currentIndex !== -1 && currentIndex !== targetIndex) {
                  console.log('[CUSTOM DRAG] Moving container from index', currentIndex, 'to index', targetIndex);
                  items.removeAt(currentIndex);
                  // Adjust target index if we removed an item before the target position
                  let adjustedTargetIndex = targetIndex;
                  
                  // NEW: Only apply adjustment if NOT moving to the very bottom
                  const isMovingToBottom = targetIndex >= items.length;
                  if (currentIndex < targetIndex && !isMovingToBottom) {
                    adjustedTargetIndex = targetIndex - 1;
                    console.log(
                      '[CUSTOM DRAG] Adjusted target index from',
                      targetIndex,
                      'to',
                      adjustedTargetIndex,
                      'due to removal'
                    );
                  }
                  items.insertAt(adjustedTargetIndex, question);
                }

                this.send('updateContainerChildrenAncestry', question, items, childrenBeforeMove);
              } else {
                // For non-containers, use moveQuestionToPosition to handle the positioning
                this.send('moveQuestionToPosition', question, targetIndex);
              }
            });
          });
        })
        .catch((error) => {
          console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
          this.set('isSettingAncestry', false);
          this.cleanupAfterMove();
        });

      this.send('hidePlacementModal');
    },

    placeAboveQuestion() {
      const question = this.get('placementQuestion');
      const targetQuestion = this.get('placementContainer');

      if (!question || !targetQuestion) return;

      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'ABOVE', targetQuestion.get('questionText'));

      // Calculate target position
      const targetIndex = this.get('items').indexOf(targetQuestion);
      console.log('[CUSTOM DRAG] Target position calculated:', targetIndex, 'for question at index:', targetIndex);

      // Store targetIndex and placement type for use in children update
      this.set('targetIndex', targetIndex);
      this.set('placementType', 'above');

      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);

      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const items = this.get('items');
        const containerId = question.get('id');
        const allChildren = items.filter((item) => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for above/below placement');
        console.log(
          '[CUSTOM DRAG] Children before move (sorted by sortOrder):',
          childrenBeforeMove.map((c) => ({
            id: c.get('id'),
            text: c.get('questionText'),
            parentId: c.get('parentId'),
            sortOrder: c.get('sortOrder')
          }))
        );
      }

      // Clear ancestry and save
      const targetParentId = targetQuestion.get('parentId');
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to target parentId:', targetParentId);

      question.set('parentId', targetParentId);

      // Save the question to persist the ancestry change
      question
        .save()
        .then(() => {
          console.log('[CUSTOM DRAG] Question ancestry set to target parentId successfully');

          // Reload the question and target to update UI
          question.reload().then(() => {
            targetQuestion.reload().then(() => {
              // Clear the ancestry flag
              this.set('isSettingAncestry', false);

              // Get fresh items array after reload and recalculate target position
              const freshItems = this.get('items');
              const freshTargetIndex = freshItems.indexOf(targetQuestion);
              // If the dragged question's current index is less than the target, subtract 1 to account for removal
              const currentIndex = freshItems.indexOf(question);
              let finalTargetIndex = freshTargetIndex;
              if (currentIndex < freshTargetIndex) {
                finalTargetIndex = freshTargetIndex - 1;
              }
              console.log('[CUSTOM DRAG] Moving question to fresh target position:', finalTargetIndex);

              // Check if the moved item is a container and handle children ancestry updates
              if (isContainer) {
                console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');

                // First, actually move the container to the target position
                if (currentIndex !== -1 && currentIndex !== finalTargetIndex) {
                  console.log('[CUSTOM DRAG] Moving container from index', currentIndex, 'to index', finalTargetIndex);
                  freshItems.removeAt(currentIndex);
                  // Adjust target index if we removed an item before the target position
                  let adjustedTargetIndex = finalTargetIndex;
                  if (currentIndex < finalTargetIndex) {
                    adjustedTargetIndex = finalTargetIndex - 1;
                    console.log(
                      '[CUSTOM DRAG] Adjusted target index from',
                      finalTargetIndex,
                      'to',
                      adjustedTargetIndex,
                      'due to removal'
                    );
                  }
                  console.log('[CUSTOM DRAG] About to insert at index:', adjustedTargetIndex, 'array length:', freshItems.length);
                  freshItems.insertAt(adjustedTargetIndex, question);
                }

                this.send('updateContainerChildrenAncestry', question, freshItems, childrenBeforeMove);
              } else {
                // For non-containers, use moveQuestionToPosition to handle the positioning
                this.send('moveQuestionToPosition', question, finalTargetIndex);
              }
            });
          });
        })
        .catch((error) => {
          console.error('[CUSTOM DRAG] Error clearing ancestry:', error);
          this.set('isSettingAncestry', false);
          this.cleanupAfterMove();
        });

      this.send('hidePlacementModal');
    },

    placeBelowQuestion() {
      const question = this.get('placementQuestion');
      const targetQuestion = this.get('placementContainer');

      if (!question || !targetQuestion) return;

      console.log('[CUSTOM DRAG] Placing', question.get('questionText'), 'BELOW', targetQuestion.get('questionText'));

      // Calculate target position
      const items = this.get('items');
      const targetIndex = items.indexOf(targetQuestion) + 1;
      console.log(
        '[CUSTOM DRAG] Target position calculated:',
        targetIndex,
        'for question at index:',
        items.indexOf(targetQuestion)
      );

      // Store targetIndex and placement type for use in children update
      this.set('targetIndex', targetIndex);
      this.set('placementType', 'below');

      // Set flag to prevent moveToPosition from interfering
      this.set('isSettingAncestry', true);

      // Check if the moved item is a container and capture children BEFORE clearing ancestry
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      let childrenBeforeMove = [];
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved via placement modal, capturing children BEFORE clearing ancestry');
        const containerId = question.get('id');
        const allChildren = items.filter((item) => item.get('parentId') === containerId);
        // Sort children by their current sortOrder to preserve their intended order
        childrenBeforeMove = allChildren.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
        console.log('[CUSTOM DRAG] Found', childrenBeforeMove.length, 'children before move for above/below placement');
        console.log(
          '[CUSTOM DRAG] Children before move (sorted by sortOrder):',
          childrenBeforeMove.map((c) => ({
            id: c.get('id'),
            text: c.get('questionText'),
            parentId: c.get('parentId'),
            sortOrder: c.get('sortOrder')
          }))
        );
      }

      // Clear ancestry and save
      const targetParentId = targetQuestion.get('parentId');
      const oldParentId = question.get('parentId');
      console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to target parentId:', targetParentId);

      question.set('parentId', targetParentId);

      // Save the question to persist the ancestry change
      question
        .save()
        .then(() => {
          console.log('[CUSTOM DRAG] Question ancestry set to target parentId successfully');

          // Reload the question and target to update UI
          question.reload().then(() => {
            targetQuestion.reload().then(() => {
              // Clear the ancestry flag
              this.set('isSettingAncestry', false);

              // Get fresh items array after reload and recalculate target position
              const freshItems = this.get('items');
              // For placeBelowQuestion, ensure we always insert immediately after the target
              const freshTargetIndex = freshItems.indexOf(targetQuestion) + 1;
              // If the dragged question's current index is less than the target, subtract 1 to account for removal
              const currentIndex = freshItems.indexOf(question);
              let finalTargetIndex = freshTargetIndex;
              
              // NEW: Only apply adjustment if NOT moving to the very bottom
              const isMovingToBottom = freshTargetIndex >= freshItems.length;
              if (currentIndex < freshTargetIndex && !isMovingToBottom) {
                finalTargetIndex = freshTargetIndex - 1;
              }
              console.log('[CUSTOM DRAG] Moving question to fresh target position:', finalTargetIndex);

              // Check if the moved item is a container and handle children ancestry updates
              if (isContainer) {
                console.log('[CUSTOM DRAG] Container moved via placement modal, updating children ancestry');

                // First, actually move the container to the target position
                if (currentIndex !== -1 && currentIndex !== finalTargetIndex) {
                  console.log('[CUSTOM DRAG] Moving container from index', currentIndex, 'to index', finalTargetIndex);
                  freshItems.removeAt(currentIndex);
                  // Adjust target index if we removed an item before the target position
                  let adjustedTargetIndex = finalTargetIndex;
                  // NEW: Check if target question is the last item in its container or top level
                  const targetParentId = targetQuestion.get('parentId');
                  let isMovingToBottom;
                  
                  if (targetParentId === null) {
                    // For top-level items (parentId is null)
                    const topLevelItems = freshItems.filter(item => item.get('parentId') === null);
                    const lastTopLevelItem = topLevelItems[topLevelItems.length - 1];
                    isMovingToBottom = targetQuestion.get('id') === lastTopLevelItem.get('id');
                  } else {
                    // For items inside containers
                    const itemsInSameContainer = freshItems.filter(item => item.get('parentId') === targetParentId);
                    const lastItemInContainer = itemsInSameContainer[itemsInSameContainer.length - 1];
                    isMovingToBottom = targetQuestion.get('id') === lastItemInContainer.get('id');
                  }
                  console.log('[CUSTOM DRAG] DEBUG - finalTargetIndex:', finalTargetIndex, 'freshItems.length:', freshItems.length, 'isMovingToBottom:', isMovingToBottom, 'targetQuestion index:', freshItems.indexOf(targetQuestion), 'targetQuestion sortOrder:', targetQuestion.get('sortOrder'));                  if (currentIndex < finalTargetIndex && !isMovingToBottom) {
                    adjustedTargetIndex = finalTargetIndex - 1;
                    console.log(
                      '[CUSTOM DRAG] Adjusted target index from',
                      finalTargetIndex,
                      'to',
                      adjustedTargetIndex,
                      'due to removal'
                    );
                  }
                  
                  // NEW: Clamp index to array length to prevent out of bounds
                  if (adjustedTargetIndex >= freshItems.length) {
                    adjustedTargetIndex = freshItems.length;
                    console.log('[CUSTOM DRAG] Clamped target index to array length:', adjustedTargetIndex);
                  }
                  console.log('[CUSTOM DRAG] About to insert at index:', adjustedTargetIndex, 'array length:', freshItems.length);
                  freshItems.insertAt(adjustedTargetIndex, question);
                }

                this.send('updateContainerChildrenAncestry', question, freshItems, childrenBeforeMove);
              } else {
                // For non-containers, use moveQuestionToPosition to handle the positioning
                this.send('moveQuestionToPosition', question, finalTargetIndex);
              }
            });
          });
        })
        .catch((error) => {
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
      console.log(
        '[CUSTOM DRAG] Selected item:',
        selectedItem.get('questionText'),
        'parentId:',
        selectedItem.get('parentId')
      );

      const items = this.get('items');
      const targetQuestion = items.objectAt(targetIndex);

      // Smart ancestry handling with two-level container rule
      const currentParentId = selectedItem.get('parentId');
      const targetParentId = targetQuestion ? targetQuestion.get('parentId') : null;

      console.log(
        '[CUSTOM DRAG] Smart ancestry check - currentParentId:',
        currentParentId,
        'targetParentId:',
        targetParentId
      );

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

      // ENFORCE TWO-LEVEL MAXIMUM NESTING RULE
      // Prevent creating more than two levels of nesting
      
      // Check if this move would violate the two-level rule
      const selectedIsContainer = selectedItem.get('isARepeater') || selectedItem.get('isContainer');
      
      // NEW: Prevent moving items into Level 2 containers (would create Level 3 nesting)
      if (targetContainerLevel === 2) {
        console.log('[CUSTOM DRAG] Cannot move into Level 2 container - would create more than two levels of nesting');
        return;
      }
      
      // NEW: Prevent moving containers that are already at Level 1 into other containers
      if (selectedIsContainer && currentContainerLevel === 1 && targetContainerLevel === 1) {
        console.log('[CUSTOM DRAG] Cannot move Level 1 container into another Level 1 container - would create Level 2 nesting');
        return;
      }

      // Apply two-level container rule
      if (currentParentId && !targetParentId) {
        // Moving from inside a container to top level
        if (currentContainerLevel === 2) {
          // If moving from Level 2 to top level, set ancestry to the Level 1 container
          const level1Container = items.findBy('id', currentParentId);
          if (level1Container) {
            console.log(
              '[CUSTOM DRAG] Moving from Level 2 to top level, setting ancestry to Level 1 container:',
              level1Container.get('questionText')
            );
            selectedItem.set('parentId', level1Container.get('id'));
          } else {
            console.log(
              '[CUSTOM DRAG] Moving from Level 2 to top level, clearing ancestry (no Level 1 container found)'
            );
            selectedItem.set('parentId', null);
          }
        } else {
          // Moving from Level 1 to top level, clear ancestry
          console.log('[CUSTOM DRAG] Moving from Level 1 to top level, clearing ancestry');
          selectedItem.set('parentId', null);
        }

        // Save the ancestry change first
        selectedItem
          .save()
          .then(() => {
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
          })
          .catch((error) => {
            console.error('[CUSTOM DRAG] Error updating ancestry:', error);
          });
      } else if (currentParentId && targetParentId) {
        // Moving from one container to another container
        // With our new rules, we only allow Level 0 to Level 1 and Level 1 to Level 0 moves
        if (currentContainerLevel === 0 && targetContainerLevel === 1) {
          // Moving from Level 0 to Level 1 container
          console.log('[CUSTOM DRAG] Moving from Level 0 to Level 1 container');
          selectedItem.set('parentId', targetParentId);

          selectedItem
            .save()
            .then(() => {
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
            })
            .catch((error) => {
              console.error('[CUSTOM DRAG] Error updating ancestry:', error);
            });
        } else if (currentContainerLevel === 1 && targetContainerLevel === 0) {
          // Moving from Level 1 to Level 0 (top level)
          console.log('[CUSTOM DRAG] Moving from Level 1 to Level 0 (top level)');
          selectedItem.set('parentId', null);

          selectedItem
            .save()
            .then(() => {
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
            })
            .catch((error) => {
              console.error('[CUSTOM DRAG] Error updating ancestry:', error);
            });
        } else {
          // Other allowed container-to-container moves (Level 0 to Level 0)
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

      console.log(
        '[CUSTOM DRAG] performMoveLogic - draggedItem:',
        draggedItem.get('questionText'),
        'parentId:',
        draggedItem.get('parentId')
      );
      console.log('[CUSTOM DRAG] performMoveLogic - fromIndex:', actualFromIndex, 'toIndex:', toIndex);

      // Check if the moved item is a container and handle children ancestry updates
      const isContainer = draggedItem.get('isARepeater') || draggedItem.get('isContainer');
      if (isContainer) {
        console.log('[CUSTOM DRAG] Container moved, handling children properly');

        // Find all descendants of this container (not just direct children)
        const containerId = draggedItem.get('id');
        const allDescendants = this.getAllDescendants(containerId, items);

        console.log('[CUSTOM DRAG] Found', allDescendants.length, 'descendants to move with container');

        // Store the old parent ID for comparison
        const oldParentId = selectedItem ? selectedItem.get('parentId') : null;
        const newParentId = draggedItem.get('parentId');

        console.log('[CUSTOM DRAG] Container move - oldParentId:', oldParentId, 'newParentId:', newParentId);

        // Update children ancestry and ensure they move with the container
        if (allDescendants.length > 0) {
          // First, update the children's ancestry to reflect the new container position
          this.send('updateContainerChildrenAncestry', draggedItem, items);

          // Then, ensure all descendants are properly positioned in the items array
          // All descendants should appear right after their container in the UI
          const containerIndex = items.indexOf(draggedItem);
          const descendantsToMove = allDescendants.slice(); // Create a copy to avoid mutation issues

          // Remove all descendants from their current positions
          descendantsToMove.forEach((descendant) => {
            const descendantIndex = items.indexOf(descendant);
            if (descendantIndex !== -1) {
              items.splice(descendantIndex, 1);
            }
          });

          // First, remove all descendants from their current positions
          descendantsToMove.forEach((descendant) => {
            const descendantIndex = items.indexOf(descendant);
            if (descendantIndex !== -1) {
              items.splice(descendantIndex, 1);
            }
          });

          // Move the container to the target position
          const currentContainerIndex = items.indexOf(draggedItem);
          const targetIndex = toIndex; // Use the original target index

          if (currentContainerIndex !== targetIndex) {
            // Remove container from current position
            items.splice(currentContainerIndex, 1);
            // Insert container at target position
            items.splice(targetIndex, 0, draggedItem);

            console.log(
              '[CUSTOM DRAG] Moved container from index',
              currentContainerIndex,
              'to target index',
              targetIndex
            );
          }

          // Now insert all descendants right after the container
          const newContainerIndex = items.indexOf(draggedItem);
          descendantsToMove.forEach((descendant, index) => {
            const insertIndex = newContainerIndex + 1 + index;
            items.splice(insertIndex, 0, descendant);
          });

          console.log(
            '[CUSTOM DRAG] Repositioned',
            descendantsToMove.length,
            'descendants after container at index',
            newContainerIndex
          );

          // Debug: Log the items array after reordering
          console.log(
            '[CUSTOM DRAG] Items array after reordering:',
            items.map((item, index) => ({
              index,
              text: item.get('questionText'),
              parentId: item.get('parentId'),
              sortOrder: item.get('sortOrder')
            }))
          );

          // Debug: Check if descendants are grouped together after container
          const containerIndexAfterMove = items.indexOf(draggedItem);
          console.log('[CUSTOM DRAG] Container index after move:', containerIndexAfterMove);

          const descendantsAfterMove = allDescendants.map((descendant) => ({
            text: descendant.get('questionText'),
            index: items.indexOf(descendant),
            parentId: descendant.get('parentId')
          }));
          console.log('[CUSTOM DRAG] Descendants positions after move:', descendantsAfterMove);
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

        // If this is a container move, the children update will handle the final completion
        if (isContainer) {
          console.log('[CUSTOM DRAG] Container move - children update will handle final completion');
          // Don't complete the move here - let updateContainerChildrenAncestry handle it
          return;
        }

        // For non-container moves, perform the update and ensure selection is cleared after completion
        parentComponent
          .get('updateSortOrderTask')
          .perform(items, false)
          .then(() => {
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
          })
          .catch((error) => {
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
      console.log(
        '[CUSTOM DRAG] childrenBeforeMove parameter:',
        childrenBeforeMove
          ? childrenBeforeMove.map((c) => ({
              id: c.get('id'),
              text: c.get('questionText'),
              parentId: c.get('parentId'),
              sortOrder: c.get('sortOrder')
            }))
          : 'null/undefined'
      );

      // Update ALL descendants of the container but preserve their parent-child relationships
      const allDescendants = this.getAllDescendants(containerId, items);
      console.log('[CUSTOM DRAG] Found', allDescendants.length, 'descendants to update');
      console.log(
        '[CUSTOM DRAG] All descendants:',
        allDescendants.map((d) => ({
          id: d.get('id'),
          text: d.get('questionText'),
          parentId: d.get('parentId'),
          sortOrder: d.get('sortOrder')
        }))
      );

      if (allDescendants.length === 0) {
        console.log('[CUSTOM DRAG] No direct children to update');
        // Even if no direct children, still refresh UI and clear flags
        const parentComponent = this.get('parentView');
        if (parentComponent && parentComponent.get('updateSortOrderTask')) {
          parentComponent
            .get('updateSortOrderTask')
            .perform(parentComponent.get('fullQuestions'), true)
            .then(() => {
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
        console.log('[CUSTOM DRAG] About to start updateChildrenSequentially');

        // Update children sequentially to avoid race conditions
        const updateChildrenSequentially = async () => {
          console.log('[CUSTOM DRAG] updateChildrenSequentially started');

          // Determine if this is a placement modal move
          const isPlacementModalMove = this.get('isMovingContainer') || this.get('isSettingAncestry');

          // Determine which array to use for positioning
          const arrayToUse = isPlacementModalMove ? parentComponent.get('fullQuestions') : items;

          // For placement modal moves, wait for the move to complete and get the updated array

          let containerIndex, containerNewSortOrder;

          if (isPlacementModalMove) {
            // Use the fullQuestions array which should reflect the completed move
            containerIndex = arrayToUse.findIndex((q) => q.get('id') === container.get('id'));
            containerNewSortOrder = containerIndex + 1;
            console.log(
              '[CUSTOM DRAG] Placement modal move - using fullQuestions array, container index:',
              containerIndex
            );
          } else {
            // Use the current items array for drag-and-drop moves
            containerIndex = items.findIndex((q) => q.get('id') === container.get('id'));
            containerNewSortOrder = containerIndex + 1;
            console.log('[CUSTOM DRAG] Drag-and-drop move - using items array, container index:', containerIndex);
          }

          console.log(
            '[CUSTOM DRAG] Container actual position after move:',
            containerIndex,
            'sort order:',
            containerNewSortOrder
          );

          // Update the container's sort order first
          container.set('sortOrder', containerNewSortOrder);
          await container.save();

          // Sort all descendants by their current sortOrder to preserve their intended order
          const sortedDescendants = allDescendants.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));

          // Calculate base sort order for descendants
          let baseSortOrder;
          if (isPlacementModalMove) {
            // For placement modal moves, use the container's actual position after the move
            const containerIndex = arrayToUse.findIndex((q) => q.get('id') === container.get('id'));
            const targetIndex = this.get('targetIndex') || 0;
            const placementType = this.get('placementType');

            if (placementType === 'inside-top') {
              // For "inside top" placement, descendants should be positioned right after the container
              baseSortOrder = containerIndex + 2; // +2 because array is 0-indexed and we want descendants after container
            } else if (placementType === 'above') {
              // For "above" placement, the moved container is at targetIndex, so descendants should be at targetIndex + 1
              baseSortOrder = targetIndex + 2; // +2 because array is 0-indexed and we want descendants after container
            } else {
              // For "below" placement, the moved container is at targetIndex, so descendants should be at targetIndex + 1
              baseSortOrder = targetIndex + 2; // +2 because array is 0-indexed and we want descendants after container
            }
            console.log(
              '[CUSTOM DRAG] Placement modal move - container index:',
              containerIndex,
              'targetIndex:',
              targetIndex,
              'placementType:',
              placementType,
              'Base sort order for descendants:',
              baseSortOrder
            );
          } else {
            // For direct moves, find where the container actually ended up in the items array
            const containerFinalIndex = items.findIndex((q) => q.get('id') === container.get('id'));
            baseSortOrder = containerFinalIndex + 2; // +2 because array is 0-indexed and we want descendants after container
            console.log(
              '[CUSTOM DRAG] Direct move - Container final index:',
              containerFinalIndex,
              'Base sort order for descendants:',
              baseSortOrder
            );
          }

          // Update all descendants with integer sort orders
          for (let i = 0; i < sortedDescendants.length; i++) {
            const descendant = sortedDescendants[i];
            const newSortOrder = baseSortOrder + i;

            console.log('[CUSTOM DRAG] Descendant', descendant.get('questionText'), '-> sort order:', newSortOrder);

            // Update descendant - preserve existing parent-child relationships, only update sort order
            const isDirectChild = descendant.get('parentId') === containerId;
            if (!isDirectChild) {
              // For nested descendants, only update sort order, preserve parentId
              descendant.set('sortOrder', newSortOrder);
            } else {
              // For direct children, update both parentId and ancestry
              descendant.set('parentId', containerId);
              descendant.set('sortOrder', newSortOrder);

              // Update ancestry to reflect the new grandparent
              const containerAncestry = container.get('ancestry');
              let newAncestry;
              if (containerAncestry) {
                // Container has ancestry, so descendant gets container's ancestry + container's ID
                newAncestry = `${containerAncestry}/${containerId}`;
              } else {
                // Container is at top level, so descendant just gets container's ID
                newAncestry = containerId.toString();
              }
              descendant.set('ancestry', newAncestry);

              console.log(
                '[CUSTOM DRAG] Updated descendant ancestry:',
                descendant.get('questionText'),
                'ancestry:',
                newAncestry
              );
            }

            try {
              await descendant.save();
            } catch (error) {
              console.error('[CUSTOM DRAG] Error saving descendant', descendant.get('questionText'), ':', error);
            }
          }

          console.log('[CUSTOM DRAG] All descendants updated with integer sort orders');

          // Reorder the arrayToUse to put descendants in the correct positions
          // Remove all descendants from their current positions
          allDescendants.forEach((descendant) => {
            const descendantIndex = arrayToUse.findIndex((q) => q.get('id') === descendant.get('id'));
            if (descendantIndex !== -1) {
              arrayToUse.removeAt(descendantIndex);
            }
          });

          // Find the container's position in the reordered array
          const containerPosition = arrayToUse.findIndex((q) => q.get('id') === container.get('id'));

          // Insert all descendants right after the container
          allDescendants.forEach((descendant, index) => {
            const insertIndex = containerPosition + 1 + index;
            arrayToUse.insertAt(insertIndex, descendant);
          });

          console.log('[CUSTOM DRAG] Reordered arrayToUse - descendants now positioned after container');

          // Force all items in the reordered array to have sort orders that match their positions
          const properlyOrderedQuestions = arrayToUse.map((item, index) => {
            const newSortOrder = index + 1;
            console.log(
              '[CUSTOM DRAG] Forcing sort order for',
              item.get('questionText'),
              'from',
              item.get('sortOrder'),
              'to',
              newSortOrder
            );
            item.set('sortOrder', newSortOrder);
            return item;
          });

          // Debug: Log the items array being used for final update
          console.log(
            '[CUSTOM DRAG] Items array for final update:',
            properlyOrderedQuestions.map((item, index) => ({
              index,
              text: item.get('questionText'),
              parentId: item.get('parentId'),
              sortOrder: item.get('sortOrder')
            }))
          );

          console.log('[CUSTOM DRAG] About to perform final updateSortOrderTask');

          console.log(
            '[CUSTOM DRAG] Final properlyOrderedQuestions array:',
            properlyOrderedQuestions.map((q) => ({
              id: q.get('id'),
              text: q.get('questionText'),
              parentId: q.get('parentId'),
              sortOrder: q.get('sortOrder')
            }))
          );

          console.log(
            '[CUSTOM DRAG] Container position in array:',
            properlyOrderedQuestions.findIndex((q) => q.get('id') === container.get('id'))
          );
          console.log(
            '[CUSTOM DRAG] Container descendants positions:',
            allDescendants.map((descendant) => ({
              text: descendant.get('questionText'),
              position: properlyOrderedQuestions.findIndex((q) => q.get('id') === descendant.get('id'))
            }))
          );

          // Use the properly ordered array for the final UI refresh
          await parentComponent.get('updateSortOrderTask').perform(properlyOrderedQuestions, false);

          console.log('[CUSTOM DRAG] Final updateSortOrderTask completed');

          // Force a UI refresh to ensure the changes are visible
          // Note: We don't need to call updateSortOrderTask again with fullQuestions
          // because the first call already updated the sort orders and the computed
          // properties will automatically reflect the changes
          console.log('[CUSTOM DRAG] UI refresh completed');

          // Only complete the move after all children are updated
          this.set('isSettingAncestry', false);
          this.set('isMovingContainer', false);
          this.set('targetIndex', null); // Clear the stored targetIndex
          this.set('placementType', null); // Clear the stored placementType
          this.cleanupAfterMove();

          console.log('[CUSTOM DRAG] Container move completed successfully');
        };

        console.log('[CUSTOM DRAG] About to call updateChildrenSequentially');

        // Add a timeout to ensure the function completes
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('updateChildrenSequentially timed out after 10 seconds'));
          }, 10000);
        });

        Promise.race([updateChildrenSequentially(), timeoutPromise]).catch((error) => {
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
      console.log(
        '[CUSTOM DRAG] moveQuestionToPosition called with question:',
        question.get('questionText'),
        'targetIndex:',
        targetIndex
      );

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

      console.log(
        '[CUSTOM DRAG] Items after move:',
        itemsCopy.map((item, index) => `${index}: ${item.get('questionText')} (parentId: ${item.get('parentId')})`)
      );

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
          console.log(
            '[CUSTOM DRAG] Container moved via placement modal, skipping reorderContainerWithChildren (children already handled)'
          );

          // For placement modal moves, wait for the move to complete before proceeding
          // The children update logic will handle the rest
          return;
        }

        // Call updateSortOrderTask with reSort=false to use our array order
        parentComponent
          .get('updateSortOrderTask')
          .perform(itemsCopy, false)
          .then(() => {
            console.log('[CUSTOM DRAG] updateSortOrderTask completed successfully');

            // Only do UI refresh for non-placement modal moves
            // Placement modal moves will be handled by the children update logic
            if (!isPlacementModalMove) {
              // Force a UI refresh to ensure the changes are visible
              parentComponent
                .get('updateSortOrderTask')
                .perform(parentComponent.get('fullQuestions'), true)
                .then(() => {
                  console.log('[CUSTOM DRAG] UI refresh completed');
                })
                .catch((error) => {
                  console.error('[CUSTOM DRAG] Error refreshing UI:', error);
                });
            }
          })
          .catch((error) => {
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
    },

    selectForMove(question, index) {
      this.send('selectItem', question, index);
    }
  },

  createDropZones() {
    const timeout = run.scheduleOnce('afterRender', this, () => {
      const items = this.element.querySelectorAll('.sortable-item');
      const selectedItem = this.get('selectedItem');

      if (!selectedItem) {
        return;
      }

      // Check if survey template is locked - don't add selection handlers if not fully editable
      const isFullyEditable = this.get('isFullyEditable');

      if (isFullyEditable) {
        // Add click handlers to all items for selection
        items.forEach((element, index) => {
                  // Add click handler to the move icon (glyphicons-move)
        const moveIcon = element.querySelector('.glyphicons-move');
          if (moveIcon) {
            const selectionClickHandler = (event) => {
              const questionElement = element.querySelector('[data-question-id]');
              if (questionElement) {
                const questionId = questionElement.getAttribute('data-question-id');
                const question = this.get('items').findBy('id', questionId);
                if (question) {
                  this.send('selectItem', question, index);
                }
              }
            };

            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(moveIcon, 'click', selectionClickHandler);
          }


        });
      }

      // Determine if selected item is inside a container
      const selectedParentId = selectedItem.get('parentId');
      const isSelectedInsideContainer = selectedParentId !== null;

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
              if (question.get('isARepeater') || question.get('isContainer')) {
                isContainer = true;
              }
            }
          }

          // Determine if this question is in the same container as the selected item
          const questionParentId = question ? question.get('parentId') : null;
          const isInSameContainer = questionParentId === selectedParentId;

          // Smart drop zone logic with two-level container rule
          let shouldShowContainerDropZone = false;
          let shouldShowRegularDropZone = false;

          // Check if selected item is a container with child containers
          const isSelectedContainer = selectedItem.get('isARepeater') || selectedItem.get('isContainer');
          let selectedHasChildContainers = false;
          if (isSelectedContainer) {
            const selectedContainerId = selectedItem.get('id');
            const selectedChildren = this.get('items').filter((item) => item.get('parentId') === selectedContainerId);
            selectedHasChildContainers = selectedChildren.some(
              (child) => child.get('isARepeater') || child.get('isContainer')
            );
          }

          // Check if selected item is a child container (inside another container)
          const isSelectedChildContainer = isSelectedContainer && selectedParentId !== null;

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

          // ENFORCE TWO-LEVEL MAXIMUM NESTING RULE
          // Prevent creating more than two levels of nesting (Level 0 -> Level 1 -> Level 2 max)
          
          // Handle child container logic first (regardless of where the target item is)
          if (isSelectedChildContainer) {
            // Selected item is a container that's already inside another container (Level 1)
            // Only allow repositioning within the same container or moving to top level
            if (isInSameContainer) {
              shouldShowRegularDropZone = true;
            }
            // Allow moving to top level (both containers and questions with no parentId)
            else if (!questionParentId) {
              if (isContainer) {
                // Show container drop zone for top-level containers
                shouldShowContainerDropZone = true;
              }
              // Always show regular drop zone for top-level items (both containers and questions)
              shouldShowRegularDropZone = true;
            }
            // DO NOT allow moving into other containers (would create Level 2 nesting)
          } else if (isSelectedInsideContainer) {
            // Selected item is inside a container (Level 1) but not a child container
            if (isContainer) {
              if (selectedHasChildContainers) {
                // If selected container has child containers, only allow same-level moves
                // Only allow container-to-container moves at the same level
                if (selectedContainerLevel === targetContainerLevel) {
                  shouldShowContainerDropZone = true;
                }
              } else {
                // ENFORCE TWO-LEVEL MAXIMUM NESTING RULE
                // Only allow container-to-container moves that don't create Level 2 nesting
                if (selectedContainerLevel === 0 && targetContainerLevel === 1) {
                  // Moving from Level 0 to Level 1 - this is allowed
                  shouldShowContainerDropZone = true;
                } else if (selectedContainerLevel === 1 && targetContainerLevel === 0) {
                  // Moving from Level 1 to Level 0 - this is allowed
                  shouldShowContainerDropZone = true;
                } else if (selectedContainerLevel === 0 && targetContainerLevel === 0) {
                  // Moving from Level 0 to Level 0 - this is allowed
                  shouldShowContainerDropZone = true;
                }
                // DO NOT allow Level 1 to Level 1 moves (would create Level 2 nesting)
                // DO NOT allow any Level 2 moves (Level 2 containers are not allowed)
              }
            } else if (isInSameContainer) {
              // Allow repositioning within the same container
              shouldShowRegularDropZone = true;
            } else if (!questionParentId) {
              // Allow moving to top level (questions with no parentId)
              shouldShowRegularDropZone = true;
            }
            // Don't show regular drop zones for questions inside containers when selected item is in container
          } else {
            // Selected item is at top level (Level 0)
            if (isContainer) {
              // If selected container has child containers, only allow top-level moves
              if (selectedHasChildContainers) {
                // Only allow moving to top level (no container drop zones)
                if (!questionParentId) {
                  shouldShowRegularDropZone = true;
                }
              } else {
                // Check if target container is at Level 1 (not Level 2)
                if (targetContainerLevel === 1) {
                  // Moving into a Level 1 container - this is allowed from top level
                  shouldShowContainerDropZone = true;
                } else if (targetContainerLevel === 0) {
                  // Moving to top level - this is always allowed
                  shouldShowRegularDropZone = true;
                }
                // DO NOT allow moving into Level 2 containers (would create Level 2 nesting)
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
          } else if (shouldShowRegularDropZone) {
            // Add blue drop zone for regular positioning
            element.classList.add('drop-zone-active');

            // Remove any existing handlers first
            if (element._dropClickHandler) {
              element.removeEventListener('click', element._dropClickHandler);
            }

            // Add click handler for drop
            const clickHandler = (event) => {
              // Prevent event bubbling
              event.preventDefault();
              event.stopPropagation();

              // Show placement modal for questions (Above/Below options)
              const selectedItem = this.get('selectedItem');
              const targetQuestion = this.get('items').objectAt(index);

              if (selectedItem && targetQuestion) {
                this.send('showPlacementModal', selectedItem, targetQuestion, 'question');
              }
            };

            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(element, 'click', clickHandler);

            // Add mouse enter/leave for visual feedback
            const enterHandler = () => this.highlightDropZone(element);
            const leaveHandler = () => this.unhighlightDropZone(element);

            this.safeAddEventListener(element, 'mouseenter', enterHandler);
            this.safeAddEventListener(element, 'mouseleave', leaveHandler);
          }
        }
      });
    });

    // Register timeout for cleanup
    this.registerTimeout(timeout, 'dropZone');
  },

  removeDropZones() {
    const items = this.element.querySelectorAll('.sortable-item');

    items.forEach((element) => {
      element.classList.remove(
        'drop-zone-active',
        'drop-zone-highlighted',
        'container-drop-zone-active',
        'container-drop-zone-highlighted'
      );

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
    const items = this.get('items');
    const containerId = container.get('id');

    // Recursively find ALL descendants of this container
    const allDescendants = this.getAllDescendants(containerId, items);

    if (allDescendants.length === 0) {
      return;
    }

    // Use run.scheduleOnce to ensure DOM is ready
    run.scheduleOnce('afterRender', this, () => {
      // Create a Set of descendant IDs for faster lookup
      const descendantIds = new Set(allDescendants.map((descendant) => descendant.get('id').toString()));

      // Find all sortable-item elements once
      const descendantElements = this.element.querySelectorAll('.sortable-item');

      // Process each element efficiently
      descendantElements.forEach((element) => {
        const questionElement = element.querySelector('[data-question-id]');
        if (questionElement) {
          const questionId = questionElement.getAttribute('data-question-id');

          if (descendantIds.has(questionId)) {
            element.classList.add('children-highlight');
          }
        }
      });
    });
  },

  // Helper method to recursively find all descendants of a container
  getAllDescendants(containerId, items) {
    const descendants = [];

    // Find direct children
    const directChildren = items.filter((item) => item.get('parentId') === containerId);
    descendants.push(...directChildren);

    // Recursively find children of children
    directChildren.forEach((child) => {
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
      elements.forEach((element) => {
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
    const index = listeners.findIndex(
      ({ element: el, event: evt, handler: hdlr }) => el === element && evt === event && hdlr === handler
    );
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },

  // Helper method to safely add event listeners and prevent duplicates
  safeAddEventListener(element, event, handler) {
    // Check if this exact listener already exists
    const existingListener = this.get('activeEventListeners').find(
      ({ element: el, event: evt, handler: hdlr }) => el === element && evt === event && hdlr === handler
    );

    if (existingListener) {
      return;
    }

    // Check if there's any listener for this element/event combination
    const existingElementListener = this.get('activeEventListeners').find(
      ({ element: el, event: evt }) => el === element && evt === event
    );

    if (existingElementListener) {
      this.safeRemoveEventListener(
        existingElementListener.element,
        existingElementListener.event,
        existingElementListener.handler
      );
    }

    // Add new listener
    element.addEventListener(event, handler);
    this.get('activeEventListeners').push({ element, event, handler });
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
      this.set('selectedItem', null);
      this.set('selectedIndex', -1);
      this.removeDropZones();
      this.removeChildrenHighlight();
      this.cleanupAfterMove();
      return; // Don't proceed with other updates when locked
    }

    // Periodic cleanup check to prevent listener accumulation
    if (this.get('activeEventListeners').length > 20) {
      this.cleanupAfterMove();
    }

    // If we have a selected item but it's no longer in the items array, clear selection
    const selectedItem = this.get('selectedItem');
    const items = this.get('items');

    if (selectedItem) {
      // Check if the selected item is still in the items array
      const itemStillExists = items.findBy('id', selectedItem.get('id'));

      if (!itemStillExists) {
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
        this.removeChildrenHighlight();
        this.cleanupAfterMove();
      } else {
        // Update the selectedIndex to match the current position
        const currentIndex = items.indexOf(itemStillExists);
        if (currentIndex !== this.get('selectedIndex')) {
          this.set('selectedIndex', currentIndex);
        }
      }
    }

    // Ensure selection handlers are always available
    this.ensureSelectionHandlers();

    // If we have a selected item, ensure drop zones are maintained after DOM updates
    if (selectedItem) {
      run.scheduleOnce('afterRender', this, () => {
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
        return;
      }

      const items = this.element.querySelectorAll('.sortable-item');

      let addedCount = 0;
      let skippedCount = 0;

      items.forEach((element, index) => {
        // Add click handler to the move icon (glyphicons-move)
        const moveIcon = element.querySelector('.glyphicons-move');
        if (moveIcon) {
          // Check if handler already exists to prevent duplicates
          const existingHandler = this.get('activeEventListeners').find(
            ({ element: el, event }) => el === moveIcon && event === 'click'
          );

          if (!existingHandler) {
            const selectionClickHandler = (event) => {
              const questionElement = element.querySelector('[data-question-id]');
              if (questionElement) {
                const questionId = questionElement.getAttribute('data-question-id');
                const question = this.get('items').findBy('id', questionId);
                if (question) {
                  this.send('selectItem', question, index);
                }
              }
            };

            // Use safe event listener to prevent duplicates
            this.safeAddEventListener(moveIcon, 'click', selectionClickHandler);
            addedCount++;
          } else {
            skippedCount++;
          }
        }
      });

      // Removed excessive logging

      // If we have a selected item, ensure drop zones are recreated
      if (this.get('selectedItem')) {
        this.createDropZones();
      }
    });
  },

  // Comprehensive cleanup method called after every move operation
  cleanupAfterMove() {
    // Emergency cleanup if we have too many listeners
    if (this.get('activeEventListeners').length > 50) {
      this.get('activeEventListeners').forEach(({ element, event, handler }) => {
        if (element && element.removeEventListener) {
          element.removeEventListener(event, handler);
        }
      });
      this.set('activeEventListeners', []);
    }

    // Cancel all registered timeouts
    this.get('cleanupTimeouts').forEach((timeout) => {
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

      return shouldRemove;
    });

    listenersToRemove.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler);
      }
    });

    // Remove the filtered listeners from tracking array
    this.set('activeEventListeners', listeners.filter((listener) => !listenersToRemove.includes(listener)));

    // Remove all drop zones and highlights
    this.removeDropZones();
    this.removeChildrenHighlight();

    // Clear any remaining DOM classes
    if (this.element) {
      const items = this.element.querySelectorAll('.sortable-item');
      items.forEach((element) => {
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
      this.ensureSelectionHandlers();
    });
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
    });
  },

  // Check if UI reflects the data changes
  checkUIState() {
    const items = this.get('items');
    const domItems = this.element.querySelectorAll('.sortable-item');

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
    const containerId = container.get('id');
    const containerIndex = items.indexOf(container);

    if (containerIndex === -1) {
      return items;
    }

    // Find all children of this container
    const children = items.filter((item) => item.get('parentId') === containerId);

    if (children.length === 0) {
      return items;
    }

    // Create a new array with container and children properly positioned
    const reorderedItems = [];
    const processedItems = new Set();

    // Add all items before the container
    for (let i = 0; i < containerIndex; i++) {
      const item = items[i];
      if (item.get('parentId') !== containerId) {
        // Don't include children yet
        reorderedItems.push(item);
        processedItems.add(item.get('id'));
      }
    }

    // Add the container
    reorderedItems.push(container);
    processedItems.add(container.get('id'));

    // Add all children of this container
    children.forEach((child) => {
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
      let children = allQuestions.filter((q) => q.get('parentId') === parent.get('id'));
      // Sort children by their old sortOrder to preserve their relative order
      children = children.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));

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

        child
          .save()
          .then(() => {
            return child.reload();
          })
          .then(() => {
            // Recursively update this child's descendants
            return this.updateSubtreeAncestryAndSortOrder(child, child.get('id'), sortOrder + 0.001, allQuestions);
          })
          .then((newSortOrder) => {
            sortOrder = newSortOrder;
            processChild(index + 1);
          })
          .catch((error) => {
            console.error('[CUSTOM DRAG] [RECURSIVE] Error processing child:', error);
            reject(error);
          });
      };

      processChild(0);
    });
  },

  showMovePrompt() {
    // Create a temporary prompt element
    const prompt = document.createElement('div');
    prompt.className = 'move-prompt';
    prompt.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        <span style="margin-right: 8px;">📋</span>
        Click on a drop zone to move this question
      </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(prompt);
    
    // Remove after 4 seconds
    setTimeout(() => {
      prompt.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (prompt.parentNode) {
          prompt.parentNode.removeChild(prompt);
        }
      }, 300);
    }, 4000);
  }
});
