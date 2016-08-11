import { moduleForModel, test } from 'ember-qunit';

moduleForModel('survey-step', 'Unit | Model | survey step', {
  // Specify the other units that are required for this test.
  needs: [
    'model:survey-template',
    'model:question'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
