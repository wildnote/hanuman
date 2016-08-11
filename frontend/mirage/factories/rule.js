import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  match_type() {
    return faker.list.random('any','all')();
  }
});
