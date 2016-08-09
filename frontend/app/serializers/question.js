import DS from 'ember-data';
import ActiveModelSerializer from 'active-model-adapter/active-model-serializer';

export default ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {
  isNewSerializerAPI: true,

  attrs: {
    rule: { embedded: 'always' }
  }
});