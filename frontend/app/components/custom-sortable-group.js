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
      console.log('[CUSTOM DRAG] Item id:', item.get('id'));
      console.log('[CUSTOM DRAG] Current selectedItem:', this.get('selectedItem') ? this.get('selectedItem').get('questionText') : 'null');
      console.log('[CUSTOM DRAG] Current selectedIndex:', this.get('selectedIndex'));
      
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
        
        // For containers, use custom approach to ensure children move with parent
        if (isContainer) {
          console.log('[CUSTOM DRAG] Using custom approach for container with children');
          
          // First, set the ancestry to the container
          const oldParentId = question.get('parentId');
          console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to', container.get('id'));
          
          question.set('parentId', container.get('id'));
          
          // Calculate sort order to place at top of container's children
          const surveyTemplate = parentComponent.get('surveyTemplate');
          if (surveyTemplate) {
            const containerChildren = surveyTemplate.get('questions')
              .filterBy('parentId', container.get('id'))
              .sortBy('sortOrder');
            
            console.log('[CUSTOM DRAG] Container children found:', containerChildren.get('length'));
            containerChildren.forEach((child, index) => {
              console.log('[CUSTOM DRAG] Child', index, ':', child.get('questionText'), 'sortOrder:', child.get('sortOrder'));
            });
            
            let newSortOrder;
            if (containerChildren.get('length') > 0) {
              // Place before the first child
              const firstChild = containerChildren.get('firstObject');
              newSortOrder = firstChild.get('sortOrder') - 0.1;
              console.log('[CUSTOM DRAG] Placing before first child (ID:', firstChild.get('id'), '), newSortOrder:', newSortOrder);
            } else {
              // No children, place right after the container
              newSortOrder = container.get('sortOrder') + 0.1;
              console.log('[CUSTOM DRAG] No children, placing after container (ID:', container.get('id'), '), newSortOrder:', newSortOrder);
            }
            
            // Ensure the sort order is valid (not negative or too small)
            if (newSortOrder <= 0) {
              newSortOrder = container.get('sortOrder') + 0.1;
              console.log('[CUSTOM DRAG] Adjusted sort order to:', newSortOrder, 'to ensure it\'s valid');
            }
            
            question.set('sortOrder', newSortOrder);
            console.log('[CUSTOM DRAG] Final sort order set for question:', newSortOrder);
          }
          
          // Save the container first
          question.save().then(() => {
            console.log('[CUSTOM DRAG] Container moved successfully');
            
            // Reload the moved container to ensure it has the latest data
            question.reload().then(() => {
              console.log('[CUSTOM DRAG] Container reloaded successfully');
              // --- NEW: Recursively update all descendants' ancestry and sortOrder ---
              console.log('[CUSTOM DRAG] Starting recursive update for question:', question.get('questionText'), 'ID:', question.get('id'));
              const allQuestions = parentComponent.get('fullQuestions');
              console.log('[CUSTOM DRAG] Total questions available:', allQuestions.length);
              this.updateSubtreeAncestryAndSortOrder(question, question.get('id'), question.get('sortOrder') + 0.001, allQuestions).then(() => {
                console.log('[CUSTOM DRAG] All descendants ancestry and sortOrder updated');
                // Force a complete UI refresh to show the moved container and children
                parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), false).then(() => {
                  console.log('[CUSTOM DRAG] UI refreshed after container and children move');
                  parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true).then(() => {
                    console.log('[CUSTOM DRAG] Final UI refresh with reSort completed');
                    this.set('isSettingAncestry', false);
                  }).catch((error) => {
                    console.error('[CUSTOM DRAG] Error in final UI refresh:', error);
                    this.set('isSettingAncestry', false);
                  });
                }).catch((error) => {
                  console.error('[CUSTOM DRAG] Error refreshing UI:', error);
                  this.set('isSettingAncestry', false);
                });
              }).catch((error) => {
                console.error('[CUSTOM DRAG] Error updating descendants ancestry/sortOrder:', error);
                this.set('isSettingAncestry', false);
              });
              // --- END NEW ---
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error reloading container:', error);
              this.set('isSettingAncestry', false);
            });
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error saving container:', error);
            this.set('isSettingAncestry', false);
          });
        } else {
          // For non-containers, use the parent's setAncestryTask
          parentComponent.get('setAncestryTask').perform(question, { target: { ancestry: container } }).then(() => {
            console.log('[CUSTOM DRAG] setAncestryTask completed for inside top placement');
            // Refresh the UI
            parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), false).then(() => {
              console.log('[CUSTOM DRAG] UI refreshed after container move');
              this.set('isSettingAncestry', false);
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error refreshing UI:', error);
              this.set('isSettingAncestry', false);
            });
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error in setAncestryTask:', error);
            this.set('isSettingAncestry', false);
          });
        }
      } else {
        console.error('[CUSTOM DRAG] Could not access parent component');
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
      
      // Check if the question being moved is a container with children
      const isContainer = question.get('isARepeater') || question.get('isContainer');
      const items = this.get('items');
      const children = isContainer ? items.filter(item => item.get('parentId') === question.get('id')) : [];
      
      console.log('[CUSTOM DRAG] Question is container:', isContainer, 'with', children.length, 'children');
      
      // Use parent's setAncestryTask for consistency
      const parentComponent = this.get('parentView');
      if (parentComponent) {
        console.log('[CUSTOM DRAG] Using parent setAncestryTask for inside bottom placement');
        
        // Ensure the container is expanded so the placed item will be visible
        if (container.get('collapsed')) {
          console.log('[CUSTOM DRAG] Container is collapsed, expanding it');
          const collapsible = parentComponent.get('collapsible');
          if (collapsible) {
            collapsible.toggleCollapsed(container);
          }
        }
        
        // For containers, use custom approach to ensure children move with parent
        if (isContainer) {
          console.log('[CUSTOM DRAG] Using custom approach for container with children');
          // First, set the ancestry to the container
          const oldParentId = question.get('parentId');
          console.log('[CUSTOM DRAG] Setting ancestry from parentId:', oldParentId, 'to', container.get('id'));
          question.set('parentId', container.get('id'));

          // Calculate sort order to place at bottom of container's children
          const surveyTemplate = parentComponent.get('surveyTemplate');
          let newSortOrder;
          if (surveyTemplate) {
            const containerChildren = surveyTemplate.get('questions')
              .filterBy('parentId', container.get('id'))
              .sortBy('sortOrder');
            let lastChildSortOrder = container.get('sortOrder');
            if (containerChildren.get('length') > 0) {
              const lastChild = containerChildren.get('lastObject');
              lastChildSortOrder = lastChild.get('sortOrder');
            }
            newSortOrder = lastChildSortOrder + 0.1;
            console.log('[CUSTOM DRAG] Placing after last child, newSortOrder:', newSortOrder);
            question.set('sortOrder', newSortOrder);
          }

          // Save the container first
          question.save().then(() => {
            console.log('[CUSTOM DRAG] Container moved successfully');
            console.log('[CUSTOM DRAG] Container sort order after save:', question.get('sortOrder'));
            // Reload the moved container to ensure it has the latest data
            question.reload().then(() => {
              console.log('[CUSTOM DRAG] Container reloaded successfully');
              // Recursively update all descendants' ancestry and sortOrder to follow the container
              const allQuestions = parentComponent.get('fullQuestions');
              let descendantSortOrder = question.get('sortOrder') + 0.001;
              function updateDescendants(parent, parentId) {
                // Find direct children
                let children = allQuestions.filter(q => q.get('parentId') === parent.get('id'));
                // Sort children by their old sortOrder to preserve their relative order
                children = children.slice().sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
                children.forEach(child => {
                  child.set('parentId', parentId);
                  child.set('sortOrder', descendantSortOrder);
                  console.log('[CUSTOM DRAG] [RECURSIVE] Setting', child.get('questionText'), 'parentId to', parentId, 'sortOrder to', descendantSortOrder);
                  descendantSortOrder += 0.001;
                  child.save().then(() => child.reload()).then(() => updateDescendants(child, child.get('id')));
                });
              }
              updateDescendants(question, question.get('id'));
              // UI refresh after a short delay to allow all saves
              setTimeout(() => {
                parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), false).then(() => {
                  console.log('[CUSTOM DRAG] UI refreshed after container and children move');
                  parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), true).then(() => {
                    console.log('[CUSTOM DRAG] Final UI refresh with reSort completed');
                    this.set('isSettingAncestry', false);
                  }).catch((error) => {
                    console.error('[CUSTOM DRAG] Error in final UI refresh:', error);
                    this.set('isSettingAncestry', false);
                  });
                }).catch((error) => {
                  console.error('[CUSTOM DRAG] Error refreshing UI:', error);
                  this.set('isSettingAncestry', false);
                });
              }, 300);
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error reloading container:', error);
              this.set('isSettingAncestry', false);
            });
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error saving container:', error);
            this.set('isSettingAncestry', false);
          });
        } else {
          // For non-containers, use the parent's setAncestryTask
          parentComponent.get('setAncestryTask').perform(question, { target: { ancestry: container } }).then(() => {
            console.log('[CUSTOM DRAG] setAncestryTask completed for inside bottom placement');
            // Refresh the UI
            parentComponent.get('updateSortOrderTask').perform(parentComponent.get('fullQuestions'), false).then(() => {
              console.log('[CUSTOM DRAG] UI refreshed after container move');
              this.set('isSettingAncestry', false);
            }).catch((error) => {
              console.error('[CUSTOM DRAG] Error refreshing UI:', error);
              this.set('isSettingAncestry', false);
            });
          }).catch((error) => {
            console.error('[CUSTOM DRAG] Error in setAncestryTask:', error);
            this.set('isSettingAncestry', false);
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
              this.send('updateContainerChildrenAncestry', question, items);
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
              this.send('updateContainerChildrenAncestry', question, items);
            }
            
            // Use moveQuestionToPosition which calls updateSortOrderTask with reSort=false
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
      
      // Update children to ensure they stay with the container
      // The key is that children should always have parentId = containerId
      const updatePromises = children.map(child => {
        const childParentId = child.get('parentId');
        
        // Children should always have the container as their parent
        if (childParentId !== containerId) {
          console.log('[CUSTOM DRAG] Updating child', child.get('questionText'), 'parentId from', childParentId, 'to', containerId);
          child.set('parentId', containerId);
          return child.save();
        } else {
          console.log('[CUSTOM DRAG] Child', child.get('questionText'), 'parentId already correct:', childParentId);
          return Promise.resolve();
        }
      });
      
      // Wait for all children to be updated
      Promise.all(updatePromises).then(() => {
        console.log('[CUSTOM DRAG] All children ancestry updated successfully');
        
        // Log the final state
        children.forEach((child, index) => {
          console.log(`[CUSTOM DRAG] Child ${index} final state:`, child.get('questionText'), 'parentId:', child.get('parentId'));
        });
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
      
      // Create a new array with the question moved to the target position
      let itemsCopy = items.slice();
      const draggedItem = itemsCopy.splice(currentIndex, 1)[0];
      itemsCopy.splice(targetIndex, 0, draggedItem);
      
      console.log('[CUSTOM DRAG] Items after move:', itemsCopy.map((item, index) => `${index}: ${item.get('questionText')} (parentId: ${item.get('parentId')})`));
      
      // Use parent's updateSortOrderTask to persist the changes to database
      const parentComponent = this.get('parentView');
      if (parentComponent && parentComponent.get('updateSortOrderTask')) {
        console.log('[CUSTOM DRAG] Using parent updateSortOrderTask to persist sort order changes');
        
        // If this is a container, ensure children are properly positioned
        const isContainer = draggedItem.get('isARepeater') || draggedItem.get('isContainer');
        if (isContainer) {
          console.log('[CUSTOM DRAG] Container moved, ensuring children are properly positioned');
          itemsCopy = this.reorderContainerWithChildren(itemsCopy, draggedItem);
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
    run.scheduleOnce('afterRender', this, () => {
      const items = this.element.querySelectorAll('.sortable-item');
      const selectedItem = this.get('selectedItem');
      console.log('[CUSTOM DRAG] Creating drop zones for', items.length, 'items');
      
      if (!selectedItem) {
        console.log('[CUSTOM DRAG] No selected item, skipping drop zone creation');
        return;
      }
      
      // Add click handlers to all items for selection
      items.forEach((element, index) => {
        // Remove any existing selection click handlers first
        if (element._selectionClickHandler) {
          element.removeEventListener('click', element._selectionClickHandler);
        }
        
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
          
          moveIcon._selectionClickHandler = selectionClickHandler;
          moveIcon.addEventListener('click', selectionClickHandler);
          console.log('[CUSTOM DRAG] Added selection click handler to move icon for item at index:', index);
        }
      });
      
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
      // Remove selection click handler from move icon
      const moveIcon = element.querySelector('.glyphicons-sorting');
      if (moveIcon && moveIcon._selectionClickHandler) {
        moveIcon.removeEventListener('click', moveIcon._selectionClickHandler);
        delete moveIcon._selectionClickHandler;
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
    
    if (selectedItem) {
      // Check if the selected item is still in the items array
      const itemStillExists = items.findBy('id', selectedItem.get('id'));
      
      if (!itemStillExists) {
        console.log('[CUSTOM DRAG] Selected item no longer in items array, clearing selection');
        this.set('selectedItem', null);
        this.set('selectedIndex', -1);
        this.removeDropZones();
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
      const items = this.element.querySelectorAll('.sortable-item');
      console.log('[CUSTOM DRAG] Ensuring selection handlers for', items.length, 'items');
      
      items.forEach((element, index) => {
        // Add click handler only to the move icon (glyphicons-sorting)
        const moveIcon = element.querySelector('.glyphicons-sorting');
        if (moveIcon && !moveIcon._selectionClickHandler) {
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
          
          moveIcon._selectionClickHandler = selectionClickHandler;
          moveIcon.addEventListener('click', selectionClickHandler);
          console.log('[CUSTOM DRAG] Added selection click handler to move icon for item at index:', index);
        }
      });
      
      // If we have a selected item, ensure drop zones are recreated
      if (this.get('selectedItem')) {
        console.log('[CUSTOM DRAG] Selected item exists, recreating drop zones');
        this.createDropZones();
      }
    });
  },

  // Force a complete refresh of the component
  forceRefresh() {
    console.log('[CUSTOM DRAG] Forcing complete component refresh');
    
    // Clear selection
    this.set('selectedItem', null);
    this.set('selectedIndex', -1);
    this.removeDropZones();
    
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