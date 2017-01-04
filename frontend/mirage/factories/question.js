import { Factory, faker } from 'ember-cli-mirage';
export default Factory.extend({
  external_data_source: '',
  ancestry: '',
  hidden: false,
  question_text(i) {
    return `${faker.lorem.sentence()} ${i}`;
  },
  required() {
    return faker.list.random(true, false)();
  },
  answer_type_id() {
    return faker.list.random(18, 19, 27, 26, 3, 50, 5, 42, 43, 52, 2, 47, 48, 7, 49, 17, 57, 56)();
  }
});
