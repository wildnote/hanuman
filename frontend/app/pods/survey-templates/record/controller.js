import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { isBlank, isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),
  surveyTemplate: alias('model'),
  hasProjectId: window.location.href.indexOf('/projects/') !== -1,
  projectId: window.location.href.split('/')[6],

  init() {
    console.log('🎯 RECORD CONTROLLER LOADED 3');
    this._super(...arguments);
  },

  actions: {
    transitionToSurveyStep() {
      console.log('RECOMPILE TEST - transitionToSurveyStep called!');
      // Transition back to the survey template record page
      this.get('router').transitionTo('survey-templates.record');
    }
  },

  updateSortOrderTask: task(function*(questions, reSort = false) {
    console.log('[updateSortOrderTask] Starting with questions:', questions);
    console.log('[updateSortOrderTask] reSort:', reSort);
    
    let lastSortOrder = 0;
    let surveyTemplate = this.get('surveyTemplate');
    let ids = [];
    
    if (reSort) {
      console.log('[updateSortOrderTask] Re-sorting questions by existing sortOrder with nested structure support');
      questions = [...questions.toArray()];
      
      // Create a map of parent containers to their children for efficient lookup
      const parentToChildren = new Map();
      questions.forEach(q => {
        const parentId = q.get('parentId');
        if (parentId) {
          if (!parentToChildren.has(parentId)) {
            parentToChildren.set(parentId, []);
          }
          parentToChildren.get(parentId).push(q);
        }
      });
      
      // Sort children within each parent by their sortOrder
      parentToChildren.forEach(children => {
        children.sort((a, b) => a.get('sortOrder') - b.get('sortOrder'));
      });
      
      // Re-sort with proper nested structure handling
      questions.sort(function(q1, q2) {
        let q1Sort = q1.get('sortOrder');
        let q2Sort = q2.get('sortOrder');
        
        // If sort orders are different, sort by sort order
        if (q1Sort !== q2Sort) {
          return q1Sort - q2Sort;
        }
        
        // If sort orders are the same, handle nested structure
        const q1ParentId = q1.get('parentId');
        const q2ParentId = q2.get('parentId');
        
        // If q1 is a child of q2, q1 should come after q2
        if (q1ParentId === q2.get('id')) {
          return 1;
        }
        
        // If q2 is a child of q1, q2 should come after q1
        if (q2ParentId === q1.get('id')) {
          return -1;
        }
        
        // If they have the same parent, maintain their relative order
        if (q1ParentId === q2ParentId) {
          return 0;
        }
        
        // If one has a parent and the other doesn't, the one without parent comes first
        if (q1ParentId && !q2ParentId) {
          return 1;
        }
        if (!q1ParentId && q2ParentId) {
          return -1;
        }
        
        // If they have different parents, sort by their parents' sort order
        if (q1ParentId && q2ParentId) {
          const q1Parent = questions.find(q => q.get('id') === q1ParentId);
          const q2Parent = questions.find(q => q.get('id') === q2ParentId);
          if (q1Parent && q2Parent) {
            return q1Parent.get('sortOrder') - q2Parent.get('sortOrder');
          }
        }
        
        // Default fallback
        return 0;
      });
      
      console.log('[updateSortOrderTask] Questions after nested structure sort:', questions.map(q => ({
        id: q.get('id'),
        text: q.get('questionText'),
        sortOrder: q.get('sortOrder'),
        parentId: q.get('parentId')
      })));
    } else {
      console.log('[updateSortOrderTask] Using questions in provided order (from drag-and-drop)');
    }
    
    console.log('[updateSortOrderTask] Final question order:', questions.map(q => [q.get('id'), q.get('questionText')]));
    
    for (let index = 0; index < questions.get('length'); index++) {
      let question = questions.objectAt(index);
      let oldSortOrder = question.get('sortOrder');
      let newSortOrder = index + 1;

      if (lastSortOrder === newSortOrder) {
        newSortOrder++;
      }
      if (oldSortOrder !== newSortOrder) {
        console.log(`[updateSortOrderTask] Updating question ${question.get('id')} (${question.get('questionText')}) from sortOrder ${oldSortOrder} to ${newSortOrder}`);
        question.set('sortOrder', newSortOrder);
      }
      lastSortOrder = newSortOrder;
      ids.push(question.get('id'));
    }
    
    console.log('[updateSortOrderTask] Final IDs to send:', ids);
    console.log('[updateSortOrderTask] Calling surveyTemplate.resortQuestions with:', { ids });
    
    yield surveyTemplate.resortQuestions({ ids });
    this._checkAncestryConsistency(questions);
  }),

  _checkAncestryConsistency(questions) {
    console.log('[updateSortOrderTask] Checking ancestry consistency for', questions.length, 'questions');
    
    questions.forEach(function(question) {
      if (isPresent(question.get('parentId'))) {
        let parentId = question.get('parentId');
        let parent = questions.findBy('id', parentId);
        let sortOrder = question.get('sortOrder');

        if (isBlank(parent)) {
          console.log('[updateSortOrderTask] Parent not found for question', question.get('id'), 'parentId:', parentId);
          return;
        }

        // Only fix parentId if the question is actually outside its parent's scope
        // A child can have a higher sort order than its parent if the parent was moved down
        // We should check if the question is still within the parent's descendant range
        let parentSortOrder = parent.get('sortOrder');
        
        // Find the next sibling or end of parent's children
        let nextSibling = null;
        for (let i = 0; i < questions.length; i++) {
          let q = questions.objectAt(i);
          if (q.get('sortOrder') > parentSortOrder && q.get('parentId') === parentId) {
            nextSibling = q;
            break;
          }
        }
        
        let parentEndSortOrder = nextSibling ? nextSibling.get('sortOrder') : parentSortOrder + 1000;
        
        // If the question is outside its parent's scope, fix it
        if (sortOrder < parentSortOrder || sortOrder > parentEndSortOrder) {
          console.log('[updateSortOrderTask] Question', question.get('id'), 'outside parent scope. parentSortOrder:', parentSortOrder, 'questionSortOrder:', sortOrder, 'parentEndSortOrder:', parentEndSortOrder);
          
          // Find the correct parent based on ancestry
          let ancestry = question.get('ancestry');
          if (ancestry) {
            let ancestryParts = ancestry.split('/');
            // Find the most recent ancestor that exists in the questions array
            for (let i = ancestryParts.length - 1; i >= 0; i--) {
              let ancestorId = ancestryParts[i];
              let ancestor = questions.findBy('id', ancestorId);
              if (ancestor && ancestor.get('sortOrder') <= sortOrder) {
                console.log('[updateSortOrderTask] Setting question', question.get('id'), 'parentId to', ancestorId);
                question.set('parentId', ancestorId);
                question.save().then(() => {
                  question.reload();
                });
                break;
              }
            }
          } else {
            // If no ancestry, set to null (top level)
            console.log('[updateSortOrderTask] Setting question', question.get('id'), 'parentId to null (top level)');
            question.set('parentId', null);
            question.save().then(() => {
              question.reload();
            });
          }
        } else {
          console.log('[updateSortOrderTask] Question', question.get('id'), 'within parent scope. parentSortOrder:', parentSortOrder, 'questionSortOrder:', sortOrder, 'parentEndSortOrder:', parentEndSortOrder);
        }
      }
    });
  }
});
