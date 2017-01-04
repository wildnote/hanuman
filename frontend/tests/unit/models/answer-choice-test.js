import { moduleForModel, test } from 'ember-qunit';

moduleForModel('answer-choice', 'Unit | Model | answer choice', {
  // Specify the other units that are required for this test.
  needs: [
  	'model:question'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
