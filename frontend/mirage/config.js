export default function() {
  this.namespace = 'hanuman/api/v1';

  // Shorthand
  this.get('/answer_types');
  this.get('/answer_types/:id');
  this.get('/survey_steps/:id');
  this.get('/survey_templates/:id');
  // Questions
  this.get('/questions/:id');
  this.post('/questions');
  this.put('/questions/:id', ({ questions }, request) => {
    let attrs = JSON.parse(request.requestBody)['question'],
        id = request.params.id;
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

}
