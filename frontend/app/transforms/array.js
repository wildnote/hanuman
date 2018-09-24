import { isArray, A } from '@ember/array';
import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize(value) {
    if (isArray(value)) {
      return A(value);
    } else {
      return A();
    }
  },
  serialize(value) {
    if (isArray(value)) {
      return A(value);
    } else {
      return A();
    }
  }
});
