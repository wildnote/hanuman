import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  duplicator() {
    return faker.list.random(true, false)();
  },
  step() {
    return faker.random.number();
  }
});
