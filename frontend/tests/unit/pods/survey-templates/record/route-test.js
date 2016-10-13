import startMirage from '../../../../helpers/setup-mirage-for-integration';
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

const { run } = Ember;

moduleFor('route:survey-templates/record', 'Unit | Route | survey templates/record', {
  // Specify the other units that are required for this test.
  needs: [
    'adapter:application',
    'serializer:question',
    'model:question',
    'model:answer-type',
    'model:survey-template',
    'model:rule',
    'model:answer-choice'
  ],
  beforeEach() {
    startMirage(this.container);
  },
  afterEach() {
    window.server.shutdown();
  }
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});


test('_checkAncestryConsistency(questions)', function(assert) {
  let route = this.subject(),
      store = route.get('store');
  setUpQuestions(store).then((questions) => {
    run(function() {
      // Simulate drang sort
      questions.objectAt(3).set('sortOrder', 5);
      questions.objectAt(4).set('sortOrder', 4);
      route._checkAncestryConsistency(questions);
    });
    assert.equal(questions.objectAt(4).get('parentId'), 3, 'Parent id was updated' );
  });
});

function setUpQuestions(store) {
  server.db.questions.remove();
  store.unloadAll('question');
  run(function() {
    window.server.create('question', { sortOrder: 1 });
    window.server.create('question', { sortOrder: 2 });
    window.server.create('question', { sortOrder: 3, parentId: 2 });
    window.server.create('question', { sortOrder: 4, parentId: 3 });
    window.server.create('question', { sortOrder: 5, parentId: 4 });
  });
  return store.findAll('question');
}


