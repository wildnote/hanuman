import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyStep, questions;

moduleForAcceptance('Acceptance | survey step', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    surveyStep = server.create('survey-step', {surveyTemplate: surveyTemplate});
    questions = server.createList('question', 5, { surveyStep });
  }
});

test('visiting /survey_steps/:id', function(assert) {
  visit(`/survey_steps/${surveyStep.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_steps/${surveyStep.id}`);
  });
});

test('displaying survey template info', function(assert) {
  visit(`/survey_steps/${surveyStep.id}`);
  andThen(function() {
    assert.equal(surveyTemplate.name,find('[data-test="surveyTemplate.name"]').text().trim());
    assert.equal(surveyTemplate.duplicator_label,find('[data-test="surveyTemplate.duplicatorLabel"]').text().trim());
  });
});

test('listing questions', function(assert) {
  visit(`/survey_steps/${surveyStep.id}`);
  andThen(function() {
    for (var question of questions) {
      assert.equal(question.question_text,find(`li[data-id="${question.id}"] [data-test="question.questionText"]`).text().trim());
    }
  });
});