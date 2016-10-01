import Ember from 'ember';
import SuperUserInitializer from 'frontend/initializers/super-user';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | super user', {
  beforeEach() {
    window.superUser = true;
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  },
  afterEach() {
    window.superUser = undefined;
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  SuperUserInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
