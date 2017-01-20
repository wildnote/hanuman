import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('survey_templates', { path: '/*wildcard' }, function() {
    this.route('new');
    this.route('record', { path: '/:survey_template_id' }, function() {
      this.route('edit');
      this.route('questions', function() {
        this.route('new');
        this.route('edit', { path: ':question_id' });
      });
    });
  });
});

export default Router;
