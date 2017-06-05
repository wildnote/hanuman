import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, question;

moduleForAcceptance('Acceptance | question', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('visiting survey_templates/:survey_step_id/questions/:id', function(assert) {
  question = server.create('question', {surveyTemplate});
  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  });
});

test('selecting a type with answer choices', function(assert) {
  question = server.create('question', {surveyTemplate, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    // Select
    fillIn('[data-test="answer-type-id-select"]', 1);
    triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
    Ember.run.later(this,function() {
      assert.notEqual(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    },0);
  });
});

test('selecting ancestry', function(assert) {
  question = server.create('question', {surveyTemplate, answer_type_id: 17}); // Answer Type id 17 = `Radio`

  const ancestryAnswerTypesId = [57,56];
  let ancestryQuestions =
    server.createList('question', 2, {
     surveyTemplate,
     answer_type_id: ancestryAnswerTypesId[Math.floor(Math.random() * ancestryAnswerTypesId.length)]
   });

  let notAncestryQuestions = server.createList('question', 2, {surveyTemplate, answer_type_id: 19});

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    for (var ancestry of ancestryQuestions) {
      assert.equal(`${ancestry.question_text} - ${ancestry.id}`,find(`[data-test="ancestry-select"] option[value="${ancestry.id}"]`).text().trim());
    }

    find('[data-test="ancestry-select"] option[value]').each(function() {
      for (var notAncestry of notAncestryQuestions) {
        assert.notEqual(`${notAncestry.question_text} - ${notAncestry.id}`,$(this).text().trim());
      }
    });
  });
});

test('adding a question', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);

  andThen(function() {
    click('a:contains("Add")').then(()=>{
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/new`);
      fillIn('[data-test="question.questionText"]', 'this is DA question');
      // Select
      fillIn('[data-test="answer-type-id-select"]', 15);
      triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
      click('[data-test="save-question-link"]').then(()=>{
        question = server.schema.questions.all().models[0];
        assert.equal(question.attrs.question_text, 'this is DA question');
      });
    });
  });
});


test('saving a question with answer_type with answers without adding any answers', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);

  andThen(function() {
    click('a:contains("Add")').then(()=>{
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/new`);
      fillIn('[data-test="question.questionText"]', 'question with answers');
      // Select
      fillIn('[data-test="answer-type-id-select"]', 17); // Radio button answer type
      triggerEvent('[data-test="answer-type-id-select"]', 'onchange').then(function() {
        click('[data-test="save-question-link"]').then(()=>{
          const el = find('[data-test="answer-choices-error"]');
          const count = el.length;
          assert.equal(count, 1);
          assert.equal(el.text().trim(), 'Please add at least one answers choice.');
        });
      });
    });
  });
});

test('canceling question edition', function(assert) {
  question = server.create('question', {surveyTemplate});
  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
    click('[data-test="cancel-question-link"]').then(()=>{
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
    });
  });

});

test('editing a question', function(assert) {
  question = server.create('question', {surveyTemplate});
  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  fillIn('[data-test="question.externalDataSource"]', 'chuchucu');
  click('[data-test="save-question-link"]').then(()=>{
    Ember.run.later(this,function() {
      question = server.db.questions.find(question.id);
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
      assert.equal(question.external_data_source, 'chuchucu');
    },0);
  });
});


test('deleting a question', function(assert) {
  surveyTemplate = server.create('survey-template', {fully_editable: false});
  let questions = server.createList('question', 2, {surveyTemplate});
  question = questions[0];
  visit(`/survey_templates/${surveyTemplate.id}`);

  andThen(function() {
    assert.equal(question.question_text,find(`[data-question-id="${question.id}"] [data-test="question.questionText"]`).text().trim());
    click(`[data-question-id="${question.id}"] [data-test="confirm-delete-question-link"]`).then(()=>{
      click(`[data-question-id="${question.id}"] [data-test="delete-question-link"]`).then(()=>{
        assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
      });
    });
    visit(`/survey_templates/${surveyTemplate.id}`).then(()=>{
      assert.notEqual(question.question_text,find('[data-test="question.questionText"]:first').text().trim());
    });
  });
});