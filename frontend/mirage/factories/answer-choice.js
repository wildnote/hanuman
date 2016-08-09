import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  option_text() {
    return faker.lorem.word();
  }
});
