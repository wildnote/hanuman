import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  option_text() {
    return faker.lorem.words(1)[0];
  },
  sort_order(i) {
    return i;
  }
});
