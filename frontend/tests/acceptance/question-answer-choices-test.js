/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate, question, answerChoices;

moduleForAcceptance('Acceptance | question answer choices', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('adding an answer choice', async function(assert) {
  assert.expect(1);
  question = server.create('question', { surveyTemplate, answer_type_id: 17 }); // Answer Type id 17 = `Rad io`

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  await click('[data-test="add-answer-choice-link"]');
  fillIn('[data-test="answerChoice.optionText"]', 'A new answer choice     ');
  await click('[data-test="save-answer-choice-link"]');
  let answerChoice = server.schema.answerChoices.all().models[0];
  assert.equal(answerChoice.optionText, 'A new answer choice', 'answer is correct and trim');
});

test('editing an answer choice', async function(assert) {
  assert.expect(4);
  question = server.create('question', { surveyTemplate, answer_type_id: 17 });
  answerChoices = server.createList('answer-choice', 3, { question });

  let firstAnswerChoices = answerChoices[0];

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  for (let answerChoice of answerChoices) {
    assert.equal(
      answerChoice.option_text,
      find(`[data-answer-choice-id="${answerChoice.id}"] [data-test="answerChoice.optionText"]`)
        .text()
        .trim()
    );
  }
  let selector = `[data-answer-choice-id="${firstAnswerChoices.id}"]`;
  await click(`${selector} [data-test="edit-answer-choice-link"]`);
  fillIn(`${selector} [data-test="answerChoice.optionText"]`, 'OOOU YEAH');
  await click(`${selector} [data-test="save-answer-choice-link"]`);

  firstAnswerChoices = server.db.answerChoices.find(firstAnswerChoices.id);
  assert.equal(firstAnswerChoices.option_text, 'OOOU YEAH');
});

test('deleting an answer choice', async function(assert) {
  assert.expect(2);
  question = server.create('question', { surveyTemplate, answer_type_id: 17 });
  let firstAnswerChoices = server.create('answer-choice', { question, option_text: 'a' });
  server.create('answer-choice', { question, option_text: 'b' });

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  let selector = `[data-answer-choice-id="${firstAnswerChoices.id}"]`;

  await click(`${selector} [data-test="delete-answer-choice-link"]`);
  await click(`${selector} [data-test="confirm-delete-answer-choice"]`);

  assert.notEqual(
    firstAnswerChoices.option_text,
    find('[data-test="answerChoice.optionText"]:first')
      .text()
      .trim()
  );

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  assert.notEqual(
    firstAnswerChoices.option_text,
    find('[data-test="answerChoice.optionText"]:first')
      .text()
      .trim()
  );
});

test('changing the answer type to one with no answer choices deletes all the previously created', async function(assert) {
  assert.expect(4);
  question = server.create('question', { surveyTemplate, answer_type_id: 17 });
  answerChoices = server.createList('answer-choice', 2, { question });

  let firstAnswerChoices = answerChoices.sortBy('sort_order').get('firstObject');

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  assert.equal(
    firstAnswerChoices.option_text,
    find('[data-test="answerChoice.optionText"]:first')
      .text()
      .trim()
  );

  fillIn('[data-test="answer-type-id-select"]', 1);
  await triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
  await click('[data-test="save-question-link"]');

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  assert.notEqual(
    firstAnswerChoices.option_text,
    find('[data-test="answerChoice.optionText"]:first')
      .text()
      .trim()
  );
  assert.notEqual(
    find('[data-test="answer-choices-label"]')
      .text()
      .trim(),
    'Answer Choices',
    'Shows answer choices'
  );
  assert.equal(0, server.schema.answerChoices.all().models.length);
});
