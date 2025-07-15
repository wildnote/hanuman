import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Condition from 'frontend/models/condition';

module('Unit | Model | condition', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('condition');
    assert.ok(!!model);
  });

  test('OPERATORS constant is defined', function(assert) {
    assert.ok(Condition.OPERATORS);
    assert.ok(Array.isArray(Condition.OPERATORS));
    assert.ok(Condition.OPERATORS.includes('is equal to'));
    assert.ok(Condition.OPERATORS.includes('is empty'));
  });

  test('OPERATORS_WITHOUT_ANSWER constant is defined', function(assert) {
    assert.ok(Condition.OPERATORS_WITHOUT_ANSWER);
    assert.ok(Array.isArray(Condition.OPERATORS_WITHOUT_ANSWER));
    assert.ok(Condition.OPERATORS_WITHOUT_ANSWER.includes('is empty'));
    assert.ok(Condition.OPERATORS_WITHOUT_ANSWER.includes('is not empty'));
  });

  test('requires answer for operators that need answers', function(assert) {
    const operatorsThatNeedAnswers = [
      'is equal to',
      'is not equal to',
      'is greater than',
      'is less than',
      'starts with',
      'contains'
    ];

    operatorsThatNeedAnswers.forEach((operator) => {
      let condition = this.owner.lookup('service:store').createRecord('condition', {
        operator: operator,
        answer: '',
        questionId: '1'
      });

      assert.notOk(condition.validate(), `Should not be valid with empty answer for operator: ${operator}`);
      assert.ok(condition.errors.has('answer'), `Should have answer error for operator: ${operator}`);
    });
  });

  test('does not require answer for operators that do not need answers', function(assert) {
    const operatorsThatDontNeedAnswers = ['is empty', 'is not empty'];

    operatorsThatDontNeedAnswers.forEach((operator) => {
      let condition = this.owner.lookup('service:store').createRecord('condition', {
        operator: operator,
        answer: '',
        questionId: '1'
      });

      assert.ok(condition.validate(), `Should be valid with empty answer for operator: ${operator}`);
      assert.notOk(condition.errors.has('answer'), `Should not have answer error for operator: ${operator}`);
    });
  });

  test('is valid with answer for operators that need answers', function(assert) {
    const operatorsThatNeedAnswers = [
      'is equal to',
      'is not equal to',
      'is greater than',
      'is less than',
      'starts with',
      'contains'
    ];

    operatorsThatNeedAnswers.forEach((operator) => {
      let condition = this.owner.lookup('service:store').createRecord('condition', {
        operator: operator,
        answer: 'some answer',
        questionId: '1'
      });

      assert.ok(condition.validate(), `Should be valid with answer for operator: ${operator}`);
    });
  });
});
