/* eslint-disable camelcase */
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';
import { settled } from '@ember/test-helpers';

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

test('cloning questions with conditional logic', async function(assert) {
  assert.expect(9);
  
  // Create trigger question with answer choices
  let triggerQuestion = server.create('question', { 
    surveyTemplate, 
    answer_type_id: 17,  // Radio button type
    question_text: 'Trigger Question'
  });
  assert.ok(triggerQuestion.id, 'Trigger question was created');
  console.log('Trigger question:', triggerQuestion);

  server.createList('answer-choice', 2, { 
    question: triggerQuestion,
    option_text: (index) => `Option ${index + 1}`
  });
  assert.equal(server.db.answerChoices.length, 2, 'Answer choices were created');
  console.log('Answer choices:', server.db.answerChoices);

  // Create dependent question
  let dependentQuestion = server.create('question', {
    surveyTemplate,
    question_text: 'Dependent Question'
  });
  assert.ok(dependentQuestion.id, 'Dependent question was created');
  console.log('Dependent question:', dependentQuestion);
  // Create rule and condition
  let rule = server.create('rule');
  let condition = server.create('condition', { 
    rule: rule,
    question_id: triggerQuestion.id,
    answer: 'Option 1',
    operator: 'is equal to'
  });

  // Associate rule with dependent question
  server.db.rules.update(rule.id, { question_id: dependentQuestion.id });
  server.db.questions.update(dependentQuestion.id, { rules: [rule] });

  // Verify rule and condition are set up correctly
  assert.ok(rule, 'Rule exists');
  console.log('Rule after update:', server.db.rules.find(rule.id));
  console.log('Dependent question ID:', dependentQuestion.id);
  let updatedRule = server.db.rules.find(rule.id);
  assert.equal(String(updatedRule.question_id), String(dependentQuestion.id), 'Rule is associated with dependent question');

  let createdCondition = server.db.conditions.find(condition.id);
  assert.ok(createdCondition, 'Condition exists');
  console.log('Created condition:', createdCondition);
  assert.equal(createdCondition.question_id, triggerQuestion.id, 'Condition references trigger question');
  assert.equal(String(createdCondition.ruleId), String(rule.id), 'Condition is associated with rule');

  // Verify the question has the rule in its rules array
  let questionWithRules = server.db.questions.find(dependentQuestion.id);
  console.log('Question with rules:', questionWithRules);
  console.log('rule.id', rule.id);
  console.log('Question with rules rules:', questionWithRules.rules);
  assert.ok(questionWithRules.rules.some(r => String(r.id) === String(rule.id)), 'Question has rule in its rules array');
 

  // Visit the survey template page
  await visit(`/survey_templates/${surveyTemplate.id}`);
  assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`, 'Navigated to survey template page');

  // Select both questions
  await find(`[data-question-id="${triggerQuestion.id}"] [data-test-question-selector]`).click();
  await find(`[data-question-id="${dependentQuestion.id}"] [data-test-question-selector]`).click();

  // Verify the questions are selected
  assert.equal(find('[data-test-selected-questions]').length, 1, 'Questions are selected');

  // Click clone button and wait for it to complete
  await click('button:contains("Clone")');
  await settled();

  // Get the cloned questions (they should be the last two questions created)
  let allQuestions = server.db.questions.where({ surveyTemplateId: surveyTemplate.id });
  let clonedTriggerQuestion = allQuestions[allQuestions.length - 2];
  let clonedDependentQuestion = allQuestions[allQuestions.length - 1];

  // Debug logging
  console.log('All rules:', server.db.rules);
  console.log('Cloned dependent question:', clonedDependentQuestion);
  let clonedRules = server.db.rules.where({ question_id: clonedDependentQuestion.id });
  console.log('Cloned rules:', clonedRules);

  // Verify the cloned questions exist
  assert.ok(clonedTriggerQuestion, 'Cloned trigger question exists');
  assert.ok(clonedDependentQuestion, 'Cloned dependent question exists');

  // Verify the question text was preserved
  assert.equal(
    clonedTriggerQuestion.question_text,
    'Trigger Question',
    'Trigger question text was preserved'
  );
  assert.equal(
    clonedDependentQuestion.question_text,
    'Dependent Question',
    'Dependent question text was preserved'
  );

  // Verify the answer type was preserved
  assert.equal(
    clonedTriggerQuestion.answer_type_id,
    17,
    'Answer type was preserved when cloning the question'
  );

  // Verify the rule was cloned
  assert.equal(clonedRules.length, 1, 'Rule was cloned');

  // Skip condition checks if no rules were cloned
  if (clonedRules.length > 0) {
    // Verify the condition was cloned
    let clonedConditions = server.db.conditions.where({ rule_id: clonedRules[0].id });
    assert.equal(clonedConditions.length, 1, 'Condition was cloned');

    // Verify the condition's question_id was remapped to the cloned trigger question
    assert.equal(
      clonedConditions[0].question_id,
      clonedTriggerQuestion.id,
      'Condition was remapped to point to the cloned trigger question'
    );

    // Verify the condition's other properties were preserved
    assert.equal(
      clonedConditions[0].answer,
      'Option 1',
      'Condition answer was preserved'
    );
  }
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
