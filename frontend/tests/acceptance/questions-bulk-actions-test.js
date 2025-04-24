/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate;
moduleForAcceptance('Acceptance | questions bulk actions', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('selecting multiple questions', async function(assert) {
  assert.expect(2);
  server.createList('question', 5, { surveyTemplate });
  await visit(`/survey_templates/${surveyTemplate.id}`);
  await find('[data-test-question-row] [data-test-question-selector]')[0].click();
  await find('[data-test-question-row] [data-test-question-selector]')[1].click();
  assert.equal(find('[data-test-selected-questions]').length, 1, 'selected header is shown');
  assert.equal(find('[data-test-total-selected-questions]').text(), '2', 'total number of selected is correct');
});

test('selecting non-adjacent questions', async function(assert) {
  assert.expect(2);
  server.createList('question', 5, { surveyTemplate });
  await visit(`/survey_templates/${surveyTemplate.id}`);
  await find('[data-test-question-row] [data-test-question-selector]')[0].click();
  await find('[data-test-question-row] [data-test-question-selector]')[4].click();
  assert.equal(find('[data-test-selected-questions]').length, 1, 'selected header is shown');
  assert.equal(find('[data-test-total-selected-questions]').text(), '2', 'total number of selected is correct');
});

test('de-selecting multiple questions', async function(assert) {
  assert.expect(2);
  server.createList('question', 5, { surveyTemplate });
  await visit(`/survey_templates/${surveyTemplate.id}`);
  find('[data-test-question-row] [data-test-question-selector]')[0].click();
  find('[data-test-question-row] [data-test-question-selector]')[1].click();
  assert.equal(find('[data-test-selected-questions]').length, 1, 'selected header is shown');
  await click('[data-test-deselect-all]');
  assert.equal(find('[data-test-selected-questions]').length, 0, 'selected header is hidden');
});

test('selecting section or repeaters questions', async function(assert) {
  assert.expect(1);

  let ancestryQuestion = server.create('question', { surveyTemplate, answer_type_id: 57 }); // Answer Type id 57 = `Repeater`
  let ancestryId = ancestryQuestion.id;
  server.createList('question', 4, { surveyTemplate, parent_id: ancestryId, ancestry: ancestryId });
  await visit(`/survey_templates/${surveyTemplate.id}`);
  find('[data-question-id=1] [data-test-question-selector]')[0].click();
  assert.equal(find('[data-test-total-selected-questions]').text(), '5', 'total number of selected is correct');
});
