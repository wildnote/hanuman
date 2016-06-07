import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('survey_step', { path: '/survey_steps/:survey_step_id' }, function() {
    this.route('question', { path: 'question/:question_id' });
  });
});

export default Router;