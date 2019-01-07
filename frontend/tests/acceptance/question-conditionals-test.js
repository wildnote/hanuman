/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate, question, rule, conditions;
moduleForAcceptance('Acceptance | question conditionals', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

// Conditional tabs shouldn't be enable on for new questions
test('creating new question hides conditional tab', async function(assert) {
  assert.expect(1);
  await visit(`/survey_templates/${surveyTemplate.id}`);
  await click('a:contains("Add")');

  assert.notEqual(
    find('[href="#tab-question-conditionals"]')
      .text()
      .trim(),
    'Conditionals',
    'Hide conditional tab'
  );
});

test('adding a conditional with a question without rule previously created', async function(assert) {
  assert.expect(4);
  server.createList('question', 5, { surveyTemplate });
  question = server.create('question', { surveyTemplate, answer_type_id: 15 });

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  assert.equal(0, server.schema.rules.all().models.length);

  await click('[data-test-add-a-visi-rule]');
  await click('[data-test="add-condition-link"]');
  // Select question
  await fillIn('[data-test="condition-question-id-select"]', 3);
  await triggerEvent('[data-test="condition-question-id-select"]', 'onchange');

  await fillIn('[data-test="condition.answer"]', '    e quiai ');
  await click('[data-test="save-condition-link"]');
  await click('[data-test="save-question-link"]');

  assert.equal(1, server.schema.rules.all().models.length);

  let condition = server.db.conditions[0];
  assert.equal(condition.answer, 'e quiai', 'conditional answer is correct and trim');
  assert.equal(condition.operator, 'is equal to');
});

test('editing a conditional', async function(assert) {
  assert.expect(4);
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  /* eslint-disable camelcase */
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rules: [rule] });
  server.db.rules.update(rule.id, { question_id: question.id });
  /* eslint-enable camelcase */
  let firstCondition = conditions[0];
  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  for (let condition of conditions) {
    assert.equal(
      condition.answer,
      find(`[data-condition-id="${condition.id}"] [data-test="condition.answer"]`)
        .text()
        .trim()
    );
  }
  let selector = `[data-condition-id="${firstCondition.id}"]`;
  await click(`${selector} [data-test="edit-condition-link"]`);
  fillIn(`${selector} [data-test="condition.answer"]`, 'eh eh epa colombia');
  await click(`${selector} [data-test="save-condition-link"]`);
  firstCondition = server.db.conditions.find(firstCondition.id);
  assert.equal(firstCondition.answer, 'eh eh epa colombia');
});

test('deleting a conditional', async function(assert) {
  assert.expect(2);
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  /* eslint-disable camelcase */
  let firstCondition = server.create('condition', { rule, question_id: 3, answer: 'to be deleted...' });
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rules: [rule] });
  rule = server.db.rules.update(rule.id, { question_id: question.id });
  /* eslint-enable camelcase */

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  let selector = `[data-condition-id="${firstCondition.id}"]`;
  await click(`${selector} [data-test="delete-condition-link"]`);

  assert.notEqual(
    firstCondition.answer,
    find('[data-test="condition.answer"]:first')
      .text()
      .trim()
  );
  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  assert.notEqual(
    firstCondition.answer,
    find('[data-test="condition.answer"]:first')
      .text()
      .trim()
  );
});

test('selecting a conditional question with answer choices', async function(assert) {
  assert.expect(1);
  // Question with answer choices
  /* eslint-disable camelcase */
  let questionWithAnsweChoices = server.create('question', { surveyTemplate, answer_type_id: 17 });
  let answerChoices = server.createList('answer-choice', 3, { question: questionWithAnsweChoices });
  let rule = server.create('rule');
  let toTestCondition = server.create('condition', { rule, question_id: questionWithAnsweChoices.id });
  let question = server.create('question', { surveyTemplate, rules: [rule] });

  rule = server.db.rules.update(rule.id, { question_id: question.id });
  /* eslint-enable camelcase */

  let firstAnswerChoice = answerChoices[0];

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  let selector = `[data-condition-id="${toTestCondition.id}"]`;
  await click(`${selector} [data-test="edit-condition-link"]`);

  // Select operator
  await fillIn(`${selector} [data-test="condition-answer-choice-dropdown"]`, firstAnswerChoice.option_text);
  await triggerEvent(`${selector} [data-test="condition-answer-choice-dropdown"]`, 'onchange');

  await click(`${selector} [data-test="save-condition-link"]`);
  toTestCondition = server.db.conditions.find(toTestCondition.id);
  assert.equal(toTestCondition.answer, firstAnswerChoice.option_text);
});

test('rule match types is properly shown', async function(assert) {
  assert.expect(1);

  server.createList('question', 3, { surveyTemplate });
  rule = server.create('rule', { match_type: 'any' });
  /* eslint-disable camelcase */
  conditions = server.createList('condition', 3, { rule, question_id: 2 });
  question = server.create('question', { surveyTemplate, rules: [rule] });
  rule = server.db.rules.update(rule.id, { question_id: question.id });
  /* eslint-enable camelcase */

  await visit(`/survey_templates/${surveyTemplate.id}`);
  assert.equal(
    find(`[data-question-id="${question.id}"] [data-test-match-type]`).length,
    2,
    'match types number is right'
  );
});

test('selecting a location type question', async function(assert) {
  assert.expect(3);

  server.get('locations', function() {
    return {
      locations: [
        { id: 9459, name: 'ERTC 1', status: 'active' },
        { id: 11680, name: 'ERTC 2', status: 'active' },
        { id: 11681, name: 'ERTC 3', status: 'active' }
      ]
    };
  });

  // Question with answer choices
  /* eslint-disable camelcase */
  server.createList('question', 3, { surveyTemplate });
  let questionLocationType = server.create('question', { question_text: 'ERTC', surveyTemplate, answer_type_id: 47 });
  let rule = server.create('rule');
  let question = server.create('question', { surveyTemplate, rules: [rule] });

  rule = server.db.rules.update(rule.id, { question_id: question.id });
  /* eslint-enable camelcase */

  await visit(`/projects/735/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  await click('[data-test="add-condition-link"]');

  // Select question
  await fillIn('[data-test="condition-question-id-select"]', questionLocationType.id);
  await triggerEvent('[data-test="condition-question-id-select"]', 'onchange');

  let options = await find('[data-test="condition-answer-choice-dropdown"] option');
  assert.equal(options[1].textContent, 'ERTC 1');
  assert.equal(options[2].textContent, 'ERTC 2');
  assert.equal(options[3].textContent, 'ERTC 3');
});
