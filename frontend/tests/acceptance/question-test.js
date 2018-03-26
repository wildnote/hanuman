/* eslint-disable camelcase */
import { later } from '@ember/runloop';
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate, question;

moduleForAcceptance('Acceptance | question', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

test('visiting survey_templates/:survey_step_id/questions/:id', function(assert) {
  question = server.create('question', { surveyTemplate });
  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  });
});

test('selecting a type with answer choices', function(assert) {
  question = server.create('question', { surveyTemplate, answer_type_id: 17 }); // Answer Type id 17 = `Radio`

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    // Select
    fillIn('[data-test="answer-type-id-select"]', 1);
    triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
    later(this, function() {
      assert.notEqual(find('[data-test="answer-choices-label"]').text().trim(), 'Answer Choices', 'Shows answer choices');
    }, 0);
  });
});

test('selecting ancestry', function(assert) {
  question = server.create('question', { surveyTemplate, answer_type_id: 17 }); // Answer Type id 17 = `Radio`

  let ancestryAnswerTypesId = [57, 56];
  let ancestryQuestions = server.createList(
    'question',
    2,
    {
      surveyTemplate,
      answer_type_id: ancestryAnswerTypesId[Math.floor(Math.random() * ancestryAnswerTypesId.length)]
    }
  );

  let notAncestryQuestions = server.createList('question', 2, { surveyTemplate, answer_type_id: 19 });

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    for (let ancestry of ancestryQuestions) {
      assert.equal(`${ancestry.question_text} - ${ancestry.id}`, find(`[data-test="ancestry-select"] option[value="${ancestry.id}"]`).text().trim());
    }

    find('[data-test="ancestry-select"] option[value]').each(function() {
      for (let notAncestry of notAncestryQuestions) {
        assert.notEqual(`${notAncestry.question_text} - ${notAncestry.id}`, $(this).text().trim());
      }
    });
  });
});

test('adding a question', async function(assert) {
  await visit(`/survey_templates/${surveyTemplate.id}`);
  await click('a:contains("Add")');

  assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/new`);

  fillIn('[data-test="question.questionText"]', 'this is DA question');
  // Select
  await fillIn('[data-test="answer-type-id-select"]', 15);
  await triggerEvent('[data-test="answer-type-id-select"]', 'onchange');
  await click('[data-test="save-question-link"]');

  question = server.schema.questions.all().models[0];
  assert.equal(question.attrs.question_text, 'this is DA question');
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
          let el = find('[data-test="answer-choices-error"]');
          let count = el.length;
          assert.equal(count, 1);
          assert.equal(el.text().trim(), 'Please add at least one answers choice.');
        });
      });
    });
  });
});

test('canceling question edition', function(assert) {
  question = server.create('question', { surveyTemplate });
  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
    click('[data-test="cancel-question-link"]').then(()=>{
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
    });
  });
});

test('editing a question', async function(assert) {
  question = server.create('question', { surveyTemplate });
  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  fillIn('[data-test="question.externalDataSource"]', 'chuchucu');
  await click('[data-test="save-question-link"]');
  question = server.db.questions.find(question.id);
  assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
  assert.equal(question.external_data_source, 'chuchucu');
});

test('deleting a question', async function(assert) {
  surveyTemplate = server.create('survey-template', { fully_editable: false });
  let questions = server.createList('question', 2, { surveyTemplate });
  question = questions[0];

  await visit(`/survey_templates/${surveyTemplate.id}`);

  assert.equal(question.question_text, find(`[data-question-id="${question.id}"] [data-test="question.questionText"]`).text().trim());

  await click(`[data-question-id="${question.id}"] [data-test="confirm-delete-question-link"]`);
  await click(`[data-question-id="${question.id}"] [data-test="delete-question-link"]`);
  assert.notEqual(question.question_text, find('[data-test="question.questionText"]:first').text().trim());
  await visit(`/survey_templates/${surveyTemplate.id}`);
  assert.notEqual(question.question_text, find('[data-test="question.questionText"]:first').text().trim());
});

test('wording when deleting a question', async function(assert) {
  let ancestryQuestion = server.create('question', { surveyTemplate, answer_type_id: 57 }); // Answer Type id 57 = `Repeater`
  let ancestryId = ancestryQuestion.id;
  server.create('question', { surveyTemplate, parent_id: ancestryId, ancestry: ancestryId, answer_type_id: 52 }); // Answer Type id 57 = `latlong`

  await visit(`/survey_templates/${surveyTemplate.id}`);
  await click(`[data-question-id="${ancestryQuestion.id}"] [data-test="confirm-delete-question-link"]`);

  assert.equal(
    'Performing this delete will also destroy associated questions within this section/repeater.',
    find(`[data-question-id="${ancestryQuestion.id}"] [data-test-delete-confirm-message]`).text().trim(),
    'has the correct wording'
  );
});

test('showing `Capture lat/long` checkboxes', async function(assert) {
  let ancestryQuestion = server.create('question', { surveyTemplate, answer_type_id: 57 }); // Answer Type id 57 = `Repeater`
  let question1 = server.create('question', { surveyTemplate, parent_id: ancestryQuestion.id, answer_type_id: 52 }); // Answer Type id 57 = `latlong`
  let question2 = server.create('question', { surveyTemplate, answer_type_id: 18 }); // Answer Type id 18 = `Checkbox`

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question1.id}`);

  assert.equal(find('[data-test="capture-lat-long"]').length, 1, 'shows capture lat/long checkboxes');

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question2.id}`);

  assert.equal(find('[data-test="capture-lat-long"]').length, 0, 'hides capture lat/long checkboxes');
});
