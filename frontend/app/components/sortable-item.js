import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';

import SortableItem from 'ember-sortable/components/sortable-item';

export default SortableItem.extend({
  classNames: ['animated'],
  classNameBindings: [
    'ancestryClassName',
    'modelIdClassName',
    'wasJustCreated:zoomInDown',
    'ancestrySelected:disabled',
    'model.highlighted:highlighted'
  ],
  ancestryClassName: '',
  modelIdClassName: '',

  wasJustCreated: alias('model.wasNew'),
  ancestrySelected: alias('model.ancestrySelected'),

  // Override methods that call sendAction
  _prepareDrag() {
    console.log('[DRAG] _prepareDrag called for:', this.get('model.id'));
    console.log('[DRAG] Element:', this.element);
    console.log('[DRAG] Group:', this.get('group'));
    console.log('[DRAG] Handle:', this.get('handle'));
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in _prepareDrag:', error);
    }
  },

  _startDrag() {
    console.log('[DRAG] _startDrag called for:', this.get('model.id'));
    console.log('[DRAG] Drag started, element:', this.element);
    console.log('[DRAG] Position before drag:', this.get('position'));
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in _startDrag:', error);
    }
  },

  _complete() {
    console.log('[DRAG] _complete called for:', this.get('model.id'));
    console.log('[DRAG] Drag completed, wasDropped:', this.get('wasDropped'));
    console.log('[DRAG] Current position:', this.get('position'));
    console.log('[DRAG] Final element position:', this.element ? this.element.style.transform : 'no element');
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in _complete:', error);
    }
  },

  drop() {
    console.log('[DRAG] drop called for:', this.get('model.id'));
    console.log('[DRAG] Drop event fired!');
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in drop:', error);
    }
  },

  dragEnter() {
    console.log('[DRAG] dragEnter called for:', this.get('model.id'));
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in dragEnter:', error);
    }
  },

  dragLeave() {
    console.log('[DRAG] dragLeave called for:', this.get('model.id'));
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in dragLeave:', error);
    }
  },

  _cancelDrag() {
    console.log('[DRAG] _cancelDrag called for:', this.get('model.id'));
    console.log('[DRAG] Drag cancelled!');
    
    try {
      // Temporarily override sendAction to prevent deprecation warnings
      const originalSendAction = this.sendAction;
      this.sendAction = () => {};
      
      // Call parent method
      this._super(...arguments);
      
      // Restore original sendAction
      this.sendAction = originalSendAction;
    } catch (error) {
      console.error('[DRAG] Error in _cancelDrag:', error);
    }
  },

  numChildrenChanged: on(
    'init',
    observer('model.{numChildren,childQuestion}', function() {
      let childQuestion = this.get('model.childQuestion');
      let numChildren = this.get('model.numChildren');
      // The class name change has to be done on the next run loop to prevent the
      // `modified twice in a single render` warning.
      run.next(this, function() {
        this.set('modelIdClassName', `model-id-${this.get('model.id')}`);
        if (childQuestion) {
          this.set('ancestryClassName', ` has-ancestry-${numChildren}`);
        } else {
          this.set('ancestryClassName', '');
        }
      });
    })
  )
});
