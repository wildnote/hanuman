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
    'ancestrySelected:disabled'
  ],
  ancestryClassName: '',
  modelIdClassName: '',

  wasJustCreated: alias('model.wasNew'),
  ancestrySelected: alias('model.ancestrySelected'),

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
