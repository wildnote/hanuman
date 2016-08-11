import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyTemplate, question, rule, conditions;
moduleForAcceptance('Acceptance | question conditionals', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

// Conditional tabs shouldn't be enable on for new questions
test('creating new question hides conditional tab', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);
  andThen(function() {
    click('a:contains("Add")').then(()=>{
      assert.notEqual(find('[href="#tab-question-conditionals"]').text().trim(), 'Conditionals', 'Hide conditional tab');
    });
  });
});

test('adding a conditional with a question without rule previously created', function(assert) {
  server.createList('question', 5, { surveyTemplate });
  question = server.create('question', {surveyTemplate});

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    assert.equal(0, server.schema.rules.all().models.length);
    click('[data-test="add-condition-link"]');
    // Select question
    fillIn('[data-test="condition-question-id-select"]', 3);
    triggerEvent('[data-test="condition-question-id-select"]', 'onchange');
    // Select operator
    fillIn('[data-test="condition-operator-select"]', 'is greater than');
    triggerEvent('[data-test="condition-operator-select"]', 'onchange');

    fillIn('[data-test="condition.answer"]', 'e quiai');
    click('[data-test="save-condition-link"]').then(()=>{
      click('[data-test="save-question-link"]').then(()=>{
        assert.equal(1, server.schema.rules.all().models.length);
        let condition = server.schema.conditions.all().models[0];
        assert.equal(condition.answer, 'e quiai');
        assert.equal(condition.operator, 'is greater than');
      });
    });

  });
});

test('editing a conditional', function(assert) {
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rule });
  rule = server.db.rules.update(rule.id, { question: question });

  let firstCondition = conditions[0];

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    for (var condition of conditions) {
      assert.equal(condition.answer, find(`[data-condition-id="${condition.id}"] [data-test="condition.answer"]`).text().trim());
    }
    let selector = `[data-condition-id="${firstCondition.id}"]`;
    click(`${selector} [data-test="edit-condition-link"]`);
    fillIn(`${selector} [data-test="condition.answer"]`, 'eh eh epa colombia');
    click(`${selector} [data-test="save-condition-link"]`).then(()=>{
      firstCondition = server.db.conditions.find(firstCondition.id);
      assert.equal(firstCondition.answer, 'eh eh epa colombia');
    });
  });
});

test('deleting a conditional', function(assert) {
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rule });
  rule = server.db.rules.update(rule.id, { question: question });

  let firstCondition = conditions[0];

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    let selector = `[data-condition-id="${firstCondition.id}"]`;

    click(`${selector} [data-test="delete-condition-link"]`).then(()=>{
      assert.notEqual(firstCondition.answer,find('[data-test="condition.answer"]:first').text().trim());
    });
    visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`).then(()=>{
      assert.notEqual(firstCondition.answer,find('[data-test="condition.answer"]:first').text().trim());
    });
  });
});
