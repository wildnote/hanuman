/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate;
moduleForAcceptance('Acceptance | questions collapsible', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('collapsing and uncollapsing', async function(assert) {
  assert.expect(5);
  server.logging = true;
  let topAncestry = server.create('question', { question_text: 'top', surveyTemplate, answer_type_id: 57 }); // Answer Type id 57 = `Repeater`
  server.createList('question', 2, { surveyTemplate, parent_id: topAncestry.id, ancestry: topAncestry.id });
  let firstAncestry = server.create('question', {
    question_text: 'first',
    surveyTemplate,
    answer_type_id: 56, // Answer Type id 56 = `Section`
    parent_id: topAncestry.id,
    ancestry: topAncestry.id
  });
  server.createList('question', 2, {
    surveyTemplate,
    parent_id: firstAncestry.id,
    ancestry: `${topAncestry.id}/${firstAncestry.id}`
  });
  let secondAncestry = server.create('question', {
    question_text: 'second',
    surveyTemplate,
    answer_type_id: 56, // Answer Type id 56 = `Section`
    parent_id: firstAncestry.id,
    ancestry: `${topAncestry.id}/${firstAncestry.id}`
  });
  server.createList('question', 2, {
    surveyTemplate,
    parent_id: secondAncestry.id,
    ancestry: `${topAncestry.id}/${firstAncestry.id}/${secondAncestry.id}`
  });

  await visit(`/survey_templates/${surveyTemplate.id}`);
  assert.equal(find('[data-question-id]').length, 9, 'all questions displayed');
  await click(`[data-question-id="${secondAncestry.id}"] [data-test-collapse]`);
  assert.equal(find('[data-question-id]').length, 7, '2 questions hidden');
  await click(`[data-question-id="${firstAncestry.id}"] [data-test-collapse]`);
  assert.equal(find('[data-question-id]').length, 4, '3 questions hidden');
  await click(`[data-question-id="${topAncestry.id}"] [data-test-collapse]`);
  assert.equal(find('[data-question-id]').length, 1, '2 questions hidden');
  await click(`[data-question-id="${topAncestry.id}"] [data-test-collapse]`);
  assert.equal(find('[data-question-id]').length, 4, 'only 3 questions showen');
});
