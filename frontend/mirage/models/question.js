import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  surveyTemplate: belongsTo(),
  rules: hasMany(),
  answerChoices: hasMany()
});
