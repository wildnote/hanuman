import DS from 'ember-data';
import ActiveModelSerializer from 'active-model-adapter/active-model-serializer';

export default ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {
  isNewSerializerAPI: true,

  attrs: {
    conditions: { embedded: 'always', deserialize: 'records' }
  },

  // Make sure conditions are properly handled
  normalize(modelClass, resourceHash, _prop) {
    // Ensure conditions is always an array
    if (resourceHash && !resourceHash.conditions) {
      resourceHash.conditions = [];
    }

    return this._super(...arguments);
  }
});
