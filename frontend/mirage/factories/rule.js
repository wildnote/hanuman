import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  match_type() {
    return faker.list.random('any', 'all')();
  },
  type: 'Hanuman::VisibilityRule'
});
