import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate;
moduleForAcceptance('Acceptance | questions bulk actions', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    server.createList('question', 5, { surveyTemplate });
  }
});

test('selecting multiple questions', async function(assert) {
  assert.expect(2);
  await visit(`/survey_templates/${surveyTemplate.id}`);
  find('[data-test-question-row] [data-test-question-selector]')[0].click();
  find('[data-test-question-row] [data-test-question-selector]')[1].click();
  assert.equal(find('[data-test-selected-questions]').length, 1, 'selected header is shown');
  assert.equal(find('[data-test-total-selected-questions]').text(), '2', 'total number of selected is correct');
});

test('de-selecting multiple questions', async function(assert) {
  assert.expect(2);
  await visit(`/survey_templates/${surveyTemplate.id}`);
  find('[data-test-question-row] [data-test-question-selector]')[0].click();
  find('[data-test-question-row] [data-test-question-selector]')[1].click();
  assert.equal(find('[data-test-selected-questions]').length, 1, 'selected header is shown');
  await click('[data-test-deselect-all]');
  assert.equal(find('[data-test-selected-questions]').length, 0, 'selected header is hidden');
});
