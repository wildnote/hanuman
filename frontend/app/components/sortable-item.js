import Ember from 'ember';
import SortableItem from 'ember-sortable/components/sortable-item';

const { observer, run } = Ember;

export default SortableItem.extend({
  classNameBindings: ['ancestryClassName'],
  ancestryClassName: '',
  numChildrenChanged: observer('model.{numChildren,childQuestion}', function(){
    let childQuestion = this.get('model.childQuestion'),
        numChildren = this.get('model.numChildren');
    // The class name change has to be done on the next run loop to prevent the
    // `modified twice in a single render` warning.
    run.later(this, function() {
      if (childQuestion) {
        this.set('ancestryClassName',` has-ancestry-${numChildren}`);
      }else{
        this.set('ancestryClassName','');
      }
    },0);
  })
});