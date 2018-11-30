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

test('deselecting tags', async function(assert) {
  assert.expect(9);

  server.create('question', {
    surveyTemplate,
    tag_list: 'cars,dogs'
  });

  server.create('question', {
    surveyTemplate,
    tag_list: 'colors,dogs'
  });

  await visit(`/survey_templates/${surveyTemplate.id}`);
  await find('[data-test-question-row] [data-test-question-selector]')[0].click();
  await find('[data-test-question-row] [data-test-question-selector]')[1].click();
  await click('[data-test-open-tagging-modal]');

  assert.equal(find('[data-test-tagging-modal]').length, 1, 'tagging modal is shown');
  await waitUntil(() => find('[data-test-tag-input-search]:enabled').length);
  assert.equal(find('[data-test-apply-tag-changes]').hasClass('disabled'), true, 'apply btn is disabled');
  await waitUntil(() => find('[data-test-tag-list]').length);

  assert.equal(
    find('[data-test-tagging-row="cars"] input').prop('indeterminate'),
    true,
    'cars tagg is partially selected'
  );

  assert.equal(
    find('[data-test-tagging-row="colors"] input').prop('indeterminate'),
    true,
    'colors tagg is partially selected'
  );

  assert.equal(find('[data-test-tagging-row="dogs"] input').prop('checked'), true, 'dogs tagg is fully selected');

  await click('[data-test-tagging-row="cars"]'); // add to all
  assert.equal(find('[data-test-apply-tag-changes]').hasClass('disabled'), false, 'apply btn is enabled');
  await click('[data-test-tagging-row="cars"]'); // deselect to all
  await click('[data-test-tagging-row="cars"]'); // initital state
  assert.equal(find('[data-test-apply-tag-changes]').hasClass('disabled'), true, 'apply btn is disabled');
  await click('[data-test-tagging-row="cars"]');
  await click('[data-test-tagging-row="cars"]');
  await click('[data-test-apply-tag-changes]');
  server.schema.questions.all().models.forEach((question) => {
    assert.equal(question.tag_list.includes('cars'), false, "doesn't include `cars`");
  });
});
