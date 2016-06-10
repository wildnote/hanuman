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

test('visiting survey_steps/:survey_step_id/question/:id', function(assert) {
  question = server.create('question', {surveyStep});
  visit(`/survey_steps/${surveyStep.id}/question/${question.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}/question/${question.id}`);
  });
});


test('selecting a type with answer choices', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  visit(`/survey_steps/${surveyStep.id}/question/${question.id}`);
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
  visit(`/survey_steps/${surveyStep.id}/question/${question.id}`);
  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}/question/${question.id}`);
    click('[data-test="cancel-question-link"]').then(()=>{
      assert.equal(currentURL(), `/survey_steps/${surveyStep.id}`);
    });
  });

});

test('editing a question', function(assert) {
  question = server.create('question', {surveyStep});
  visit(`/survey_steps/${surveyStep.id}/question/${question.id}`);
  fillIn('[data-test="question.externalDataSource"]', 'chuchucu');
  click('[data-test="save-question-link"]').then(()=>{
    question = server.db.questions.find(question.id);
    assert.equal(question.external_data_source, 'chuchucu');
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}`);
  });
});