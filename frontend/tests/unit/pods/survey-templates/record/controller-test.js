import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { moduleFor, test } from 'ember-qunit';
import RSVP from 'rsvp';

const { Promise } = RSVP;

moduleFor('controller:survey-templates/record', 'Unit | Controller | survey templates/record', {
  // Specify the other units that are required for this test.
  needs: ['service:notify']
});

test('check ancestry consistency when sorting up', function(assert) {
  let controller = this.subject();
  let questions = A([
    EmberObject.create({ id: 1, sortOrder: 1, save: fakeSave }),
    EmberObject.create({ id: 2, sortOrder: 2, save: fakeSave }),
    EmberObject.create({ id: 3, sortOrder: 3, parentId: 2, save: fakeSave }),
    EmberObject.create({ id: 4, sortOrder: 4, parentId: 3, save: fakeSave }),
    EmberObject.create({ id: 5, sortOrder: 5, parentId: 4, save: fakeSave }),
    EmberObject.create({ id: 6, sortOrder: 6, parentId: 2, save: fakeSave }),
    EmberObject.create({ id: 7, sortOrder: 7, parentId: 2, save: fakeSave })
  ]);

  assert.equal(questions.objectAt(4).get('parentId'), 4);
  // Simulate drang sort
  questions[3].set('sortOrder', 5);
  questions[4].set('sortOrder', 4);
  controller._checkAncestryConsistency(questions);
  assert.equal(questions.objectAt(4).get('parentId'), 3, 'Parent id was updated');
});

function fakeSave() {
  return new Promise(function() {});
}
