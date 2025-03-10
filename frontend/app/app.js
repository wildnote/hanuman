import $ from 'jquery';
import Application from '@ember/application';
import LinkComponent from '@ember/routing/link-component';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

LinkComponent.reopen({
  attributeBindings: ['data-test']
});

window.jQuery = window.$ = $;  // Make jQuery globally available

const App = Application.extend({
  rootElement: '#ember-container',
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
