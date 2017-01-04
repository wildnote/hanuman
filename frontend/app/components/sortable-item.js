import Ember from 'ember';
import SortableItem from 'ember-sortable/components/sortable-item';

const { observer, computed, run, on } = Ember;

export default SortableItem.extend({
  classNames: ['animated'],
  classNameBindings: ['ancestryClassName','modelIdClassName','wasJustCreated:zoomInDown'],
  ancestryClassName: '',
  modelIdClassName: '',
  wasJustCreated: computed('model.wasNew', function() {
    return this.get('model.wasNew');
  }),
  numChildrenChanged: on('init', observer('model.{numChildren,childQuestion}', function() {
    let childQuestion = this.get('model.childQuestion'),
        numChildren = this.get('model.numChildren');
    // The class name change has to be done on the next run loop to prevent the
    // `modified twice in a single render` warning.
    run.next(this, function() {
      this.set('modelIdClassName',`model-id-${this.get('model.id')}`);
      if (childQuestion) {
        this.set('ancestryClassName',` has-ancestry-${numChildren}`);
      }else{
        this.set('ancestryClassName','');
      }
    });
  }))
});