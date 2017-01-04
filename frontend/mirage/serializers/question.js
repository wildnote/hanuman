import BaseSerializer from './application';

export default BaseSerializer.extend({
  include: ['answerChoices','surveyTemplate','rule'],
  serialize() {
    let json = BaseSerializer.prototype.serialize.apply(this, arguments);
    // Rule has to be embed
    if(json.rules){
      json.rule = json.rules[0];
      delete json.rules;
    }
    return json;
  }
});