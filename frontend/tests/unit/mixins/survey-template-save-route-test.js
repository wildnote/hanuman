import EmberObject from '@ember/object';
import SurveyTemplateSaveRouteMixin from 'frontend/mixins/survey-template-save-route';
import { module, test } from 'qunit';

module('Unit | Mixin | survey template save route');

// Replace this with your real tests.
test('it works', function(assert) {
  let SurveyTemplateSaveRouteObject = EmberObject.extend(SurveyTemplateSaveRouteMixin);
  let subject = SurveyTemplateSaveRouteObject.create();
  assert.ok(subject);
});
