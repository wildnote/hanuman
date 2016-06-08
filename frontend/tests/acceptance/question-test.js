import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyStep, question;

moduleForAcceptance('Acceptance | question', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    surveyStep = server.create('survey-step', {surveyTemplate});
    question = server.create('question', {surveyStep});
  }
});

test('visiting survey_steps/:survey_step_id/question/:id', function(assert) {
  visit(`/survey_steps/${surveyStep.id}/question/${question.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}/question/${question.id}`);
  });
});
