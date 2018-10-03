import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('question', 'Unit | Model | question', {
  // Specify the other units that are required for this test.
  needs: [
    'model:answer-type',
    'model:survey-template',
    'model:rule',
    'model:answer-choice',
    'model:condition',
    'model:data-source'
  ]
});

test('ruleMatchType', function(assert) {
  let model = this.subject();
  let store = this.store();
  run(function() {
    let rule = store.createRecord('rule', { matchType: 'all' });
    model.get('rules').pushObject(rule);
    assert.equal(model.get('ruleMatchType'), 'AND');
    rule.set('matchType', null);
    assert.equal(model.get('ruleMatchType'), 'OR');
  });
});
