import { sortableClasses } from 'frontend/helpers/sortable-classes';
import { module, test } from 'qunit';

module('Unit | Helper | sortable classes');

// Replace this with your real tests.
test('with no ancestry', function(assert) {
  let result = sortableClasses([false]);
  assert.equal(result, 'li-question row question-border item');
});

test('with ancestry', function(assert) {
  let result = sortableClasses([true]);
  assert.equal(result, 'li-question row question-border item has-ancestry');
});