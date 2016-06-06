import { moduleForModel, test } from 'ember-qunit';

moduleForModel('condition', 'Unit | Model | condition', {
  // Specify the other units that are required for this test.
  needs: [
    'model:rule',
    'model:question'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
