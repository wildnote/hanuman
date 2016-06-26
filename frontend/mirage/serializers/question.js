import BaseSerializer from './application';
import { Serializer } from 'ember-cli-mirage';

export default BaseSerializer.extend({
  include: ['answerChoices','surveyStep','rule'],
  serialize(question, request) {
    let json = BaseSerializer.prototype.serialize.apply(this, arguments);
    // Rule has to be embed
    if(json.rules){
      json.rule = json.rules[0];
      delete json.rules;
    }
    return json;
  }
});