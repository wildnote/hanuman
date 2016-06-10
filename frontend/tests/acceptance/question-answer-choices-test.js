import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyStep, question, answerChoices;

moduleForAcceptance('Acceptance | question answer choices', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    surveyStep = server.create('survey-step', {surveyTemplate});
  }
});


test('adding an answer choice', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);

  andThen(function() {
    click('[data-test="add-answer-choice-link"]');
    fillIn('[data-test="answerChoice.optionText"]', 'A new answer choice');
    click('[data-test="save-answer-choice-link"]').then(()=>{
      let answerChoice = server.schema.answerChoices.all().models[0];
      assert.equal(answerChoice.optionText, 'A new answer choice');
    });
  });
});

test('editing an answer choice', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17});
  answerChoices = server.createList('answer-choice', 3, { question });

  let firstAnswerChoices = answerChoices[0];

  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);

  andThen(function() {
    for (var answerChoice of answerChoices) {
      assert.equal(answerChoice.option_text,find(`[data-answer-choice-id="${answerChoice.id}"] [data-test="answerChoice.optionText"]`).text().trim());
    }
    let selector = `[data-answer-choice-id="${firstAnswerChoices.id}"]`;
    click(`${selector} [data-test="edit-answer-choice-link"]`);
    fillIn(`${selector} [data-test="answerChoice.optionText"]`, 'OOOU YEAH');
    click(`${selector} [data-test="save-answer-choice-link"]`).then(()=>{
      firstAnswerChoices = server.db.answerChoices.find(firstAnswerChoices.id);
      assert.equal(firstAnswerChoices.option_text, 'OOOU YEAH');
    });
  });
});

test('deleting an answer choice', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17});
  answerChoices = server.createList('answer-choice', 2, { question });

  let firstAnswerChoices = answerChoices[0];

  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);

  andThen(function() {
    let selector = `[data-answer-choice-id="${firstAnswerChoices.id}"]`;

    click(`${selector} [data-test="delete-answer-choice-link"]`).then(()=>{
      assert.notEqual(firstAnswerChoices.option_text,find('[data-test="answerChoice.optionText"]:first').text().trim());
    });
    visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`).then(()=>{
      assert.notEqual(firstAnswerChoices.option_text,find('[data-test="answerChoice.optionText"]:first').text().trim());
    });
  });
});
