/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';
import { waitUntil } from '@ember/test-helpers';

let surveyTemplate;
moduleForAcceptance('Acceptance | bulk tagging', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('when there no available tags', async function(assert) {
  assert.expect(2);
  server.createList('question', 5, { surveyTemplate });
  await visit(`/survey_templates/${surveyTemplate.id}`);
  await find('[data-test-question-row] [data-test-question-selector]')[0].click();
  await find('[data-test-question-row] [data-test-question-selector]')[1].click();
  await click('[data-test-open-tagging-modal]');

  assert.equal(find('[data-test-tagging-modal]').length, 1, 'tagging modal is shown');

  await waitUntil(() => find('[data-test-tag-input-search]:enabled').length);
  await fillIn('[data-test-tag-input-search]', 'a new tag');
  assert.equal(find('[data-test-new-tag-label]').text(), 'a new tag', 'new tag text');
});
