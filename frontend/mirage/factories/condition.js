import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  answer() {
    return faker.lorem.words(1)[0];
  }
});
