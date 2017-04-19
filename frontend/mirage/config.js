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

  // Conditions
  this.get('/conditions/:id');
  this.post('/conditions');
  this.del('/conditions/:id');
  this.put('/conditions/:id', ({ conditions }, request) => {
    let attrs = JSON.parse(request.requestBody)['condition'],
        id = request.params.id;
    return conditions.find(id).update(attrs);
  });
  // Rules
  this.post('/rules');
  this.put('/rules/:id', ({ rules }, request) => {
    let attrs = JSON.parse(request.requestBody)['rule'],
        id = request.params.id;
    return rules.find(id).update(attrs);
  });
  // Questions
  this.get('/questions');
  this.get('/questions/:id');
  this.post('/questions', (schema, request) => {
    const attrs = JSON.parse(request.requestBody).question;
    return schema.questions.create(attrs);
  });
  this.del('/questions/:id');
  this.put('/questions/:id', ({ questions }, request) => {
    let attrs = JSON.parse(request.requestBody)['question'],
        id = request.params.id;
    delete attrs.rule;
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

  // Custom Organizations
  this.get('/organizations', () => {
    return new Mirage.Response(200, {}, { organizations: []});
  });

}
