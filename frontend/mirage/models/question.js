import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  surveyTemplate: belongsTo(),
  rule: belongsTo(),
  answerChoices: hasMany()
});
