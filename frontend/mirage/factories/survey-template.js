import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  survey_type: 'Biological Resources',
  duplicator_label: 'Observation(s)',
  fully_editable: true,
  name() {
    return faker.name.jobType();
  },
  status() {
    return faker.list.random('draft', 'active', 'inactive')();
  }
});
