import { moduleForModel, test } from 'ember-qunit';

moduleForModel('survey-template', 'Unit | Model | survey template', {
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
