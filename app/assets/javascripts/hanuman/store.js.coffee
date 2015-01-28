
# Override the default adapter with the `DS.ActiveModelAdapter` which
# is built to work nicely with the ActiveModel::Serializers gem.
App.ApplicationAdapter = DS.ActiveModelAdapter.extend({
  namespace: 'hanuman/api/v1'
})

#App.ApplicationAdapter = DS.FixtureAdapter
