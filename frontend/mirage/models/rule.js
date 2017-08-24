import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  conditions: hasMany(),
  question: belongsTo()
});
