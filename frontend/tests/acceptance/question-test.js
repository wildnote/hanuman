import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyStep, question;

moduleForAcceptance('Acceptance | question', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    surveyStep = server.create('survey-step', {surveyTemplate});
  }
});

test('visiting survey_steps/:survey_step_id/questions/:id', function(assert) {
  question = server.create('question', {surveyStep});
  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}/questions/${question.id}`);
  });
});


test('selecting a type with answer choices', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    fillIn('[data-test="answer-type-id-select"]', 1);
    triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
    Ember.run.later(this,function() {
      assert.notEqual(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    },0);
  });
});

test('canceling question edition', function(assert) {
  question = server.create('question', {surveyStep});
  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}/questions/${question.id}`);
    click('[data-test="cancel-question-link"]').then(()=>{
      assert.equal(currentURL(), `/survey_steps/${surveyStep.id}`);
    });
  });

});

test('editing a question', function(assert) {
  question = server.create('question', {surveyStep});
  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);
  fillIn('[data-test="question.externalDataSource"]', 'chuchucu');
  click('[data-test="save-question-link"]').then(()=>{
    question = server.db.questions.find(question.id);
    assert.equal(question.external_data_source, 'chuchucu');
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}`);
  });
});

test('deleting a question', function(assert) {
  let questions = server.createList('question', 2, {surveyStep});
  question = questions[0];
  visit(`/survey_steps/${surveyStep.id}`);

  andThen(function() {
    assert.equal(question.question_text,find(`li[data-id="${question.id}"] [data-test="question.questionText"]`).text().trim());
    click(`li[data-id="${question.id}"] [data-test="delete-question-link"]`).then(()=>{
      assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
    });
    visit(`/survey_steps/${surveyStep.id}`).then(()=>{
      assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
    });
  });
});

test('deleting a question with `surveyTemplate.fullyEditable`', function(assert) {
  surveyTemplate = server.create('survey-template', {fully_editable: false});
  surveyStep = server.create('survey-step', {surveyTemplate});
  let questions = server.createList('question', 2, {surveyStep});
  question = questions[0];
  visit(`/survey_steps/${surveyStep.id}`);

  andThen(function() {
    assert.equal(question.question_text,find(`li[data-id="${question.id}"] [data-test="question.questionText"]`).text().trim());
    click(`li[data-id="${question.id}"] [data-test="confirm-delete-question-link"]`).then(()=>{
      click(`li[data-id="${question.id}"] [data-test="delete-question-link"]`).then(()=>{
        assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
      });
    });
    visit(`/survey_steps/${surveyStep.id}`).then(()=>{
      assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
    });
  });
});