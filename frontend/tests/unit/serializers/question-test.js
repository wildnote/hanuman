import { moduleForModel, test } from 'ember-qunit';

moduleForModel('question', 'Unit | Serializer | question', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:question',
    'model:answer-type',
    'model:survey-template',
    'model:rule',
    'model:answer-choice'
  ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
