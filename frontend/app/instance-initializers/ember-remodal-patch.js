import EmberRemodalComponent from 'ember-remodal/components/ember-remodal';
import { on } from '@ember/object/evented';

export function initialize(appInstance) {
  // Monkey patch the ember-remodal component to fix the deprecation warning
  EmberRemodalComponent.reopen({
    // Override the openDidFire method to use closure actions
    openDidFire: on('opened', function() {
      // If onOpen is a function (closure action), call it directly
      if (typeof this.onOpen === 'function') {
        this.onOpen();
      } 
      // Otherwise, if onOpen is defined but not a function, use sendAction (for backward compatibility)
      else if (this.onOpen) {
        this.sendAction('onOpen');
      }
    }),

    // Override the closeDidFire method to use closure actions
    closeDidFire: on('closed', function() {
      // If onClose is a function (closure action), call it directly
      if (typeof this.onClose === 'function') {
        this.onClose();
      } 
      // Otherwise, if onClose is defined but not a function, use sendAction (for backward compatibility)
      else if (this.onClose) {
        this.sendAction('onClose');
      }
    })
  });
}

export default {
  name: 'ember-remodal-patch',
  initialize
};
