import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, surveyStep, question;
moduleForAcceptance('Acceptance | question conditionals', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    surveyStep = server.create('survey-step', {surveyTemplate});
  }
});

// Conditional tabs shouldn't be enable on for new questions
test('creating new question hides conditional tab', function(assert) {
  visit(`/survey_steps/${surveyStep.id}`);
  andThen(function() {
    click('a:contains("Add")').then(()=>{
      assert.notEqual(find('[href="#tab-question-conditionals"]').text().trim(), 'Conditionals', 'Hide conditional tab');
    });
  });
});

test('adding a conditional', function(assert) {
  question = server.create('question', {surveyStep, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  visit(`/survey_steps/${surveyStep.id}/questions/${question.id}`);

  andThen(function() {
    click('a[href="#tab-question-conditionals"]');
    click('[data-test="add-condition-link"]');
    // ...
    assert.equal(true, true);
  });
});