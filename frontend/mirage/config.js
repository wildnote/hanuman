import Mirage from 'ember-cli-mirage';

export default function() {
  this.namespace = '/hanuman/api/v1';

  // Shorthand
  this.get('/answer_types');
  this.get('/answer_types/:id');
  this.get('/survey_templates/:id');
  this.post('/survey_templates');
  this.del('/survey_templates/:id');
  this.put('/survey_templates/:id', ({ surveyTemplates }, request) => {
    let attrs = JSON.parse(request.requestBody)['survey_template'],
      id = request.params.id;
    return surveyTemplates.find(id).update(attrs);
  });
  this.get('survey_templates/:id/available_tags', ({ questions }, request) => {
    let tags = questions.all().models.map((question) => question.tag_list.split(','));
    tags = tags.flatten().filter(Boolean);
    tags = [...new Set(tags)];
    return new Mirage.Response(200, {}, { tags });
  });

  this.patch('/survey_templates/:id/resort_questions', ({ surveyTemplates }, request) => {
    let id = request.params.id;
    return surveyTemplates.find(id);
  });

  // Conditions
  this.get('/conditions/:id');
  this.post('/conditions');
  this.del('/conditions/:id');
  this.put('/conditions/:id', ({ conditions }, request) => {
    let attrs = JSON.parse(request.requestBody)['condition'],
      id = request.params.id;
    return conditions.find(id).update(attrs);
  });
  this.get('/locations', () => {
    return {
      locations: []
    };
  });
  // Rules
  // https://github.com/samselikoff/ember-cli-mirage/issues?utf8=%E2%9C%93&q=is%3Aissue+hasInverseFor
  this.post('/rules', ({ rules, conditions }, request) => {
    const attrs = JSON.parse(request.requestBody).rule;
    let conditionAttrs = attrs.conditions;
    delete attrs.conditions;
    let rule = rules.create(attrs);
    if (conditionAttrs) {
      for (let condition of conditionAttrs) {
        condition['rule_id'] = rule.id;
        conditions.create(condition);
      }
    }
    return rule;
  });
  this.put('/rules/:id', ({ rules }, request) => {
    let attrs = JSON.parse(request.requestBody)['rule'],
      id = request.params.id;
    return rules.find(id).update(attrs);
  });
  this.get('/rules/:id');
  // Questions
  this.get('/questions', ({ questions }) => {
    let questionsResponse = questions.all();
    questionsResponse.models.forEach(function(question) {
      question.attrs.child_ids = questions
        .all()
        .models.filter(q => q.parent_id === question.id)
        .map(q => q.id);
    });
    return questionsResponse;
  });

  this.get('/questions/:id');
  this.post('/questions', (schema, request) => {
    const attrs = JSON.parse(request.requestBody).question;
    return schema.questions.create(attrs);
  });
  this.del('/questions/:id');
  this.put('/questions/:id', ({ questions }, request) => {
    let attrs = JSON.parse(request.requestBody)['question'],
      id = request.params.id;
    delete attrs.rules;
    return questions.find(id).update(attrs);
  });
  // Answer Choices
  this.get('/answer_choices/:id');
  this.post('/answer_choices');
  this.del('/answer_choices/:id');
  this.put('/answer_choices/:id', ({ answerChoices }, request) => {
    let attrs = JSON.parse(request.requestBody)['answer_choice'],
      id = request.params.id;
    return answerChoices.find(id).update(attrs);
  });
  // Data Sources
  this.get('/data_sources');
  this.get('/data_sources/:id');

  // Custom Organizations
  this.get('/organizations', () => {
    return new Mirage.Response(200, {}, { organizations: [] });
  });

  this.get('/survey_template_export_types', () => {
    return new Mirage.Response(200, {}, { survey_template_export_types: [] });
  });
}
