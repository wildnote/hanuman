import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import RSVP from 'rsvp';

const { A } = Ember;
const { Promise } = RSVP;

moduleFor('route:survey-templates/record', 'Unit | Route | survey templates/record', {
  // Specify the other units that are required for this test.
  // needs: []
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});


test('check ancestry consistency when sorting up', function(assert) {
  let route = this.subject(),
      questions = A([
        Ember.Object.create({id: 1, sortOrder: 1, save: fakeSave }),
        Ember.Object.create({id: 2, sortOrder: 2, save: fakeSave }),
        Ember.Object.create({id: 3, sortOrder: 3, parentId: 2, save: fakeSave }),
        Ember.Object.create({id: 4, sortOrder: 4, parentId: 3, save: fakeSave }),
        Ember.Object.create({id: 5, sortOrder: 5, parentId: 4, save: fakeSave }),
        Ember.Object.create({id: 6, sortOrder: 6, parentId: 2, save: fakeSave }),
        Ember.Object.create({id: 7, sortOrder: 7, parentId: 2, save: fakeSave })
      ]);

  assert.equal(questions.objectAt(4).get('parentId'), 4 );
  // Simulate drang sort
  questions[3].set('sortOrder', 5);
  questions[4].set('sortOrder', 4);
  route._checkAncestryConsistency(questions);
  assert.equal(questions.objectAt(4).get('parentId'), 3, 'Parent id was updated' );
});

function fakeSave() {
  return new Promise(function() {});
}

