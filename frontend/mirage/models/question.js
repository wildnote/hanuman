import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  surveyStep: belongsTo(),
  rule: belongsTo(),
  answerChoices: hasMany()
});
