import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  isLoadingQuestions: true,
  surveyTemplate: alias('model'),
  hasProjectId: window.location.href.indexOf('/projects/') !== -1,
  projectId: window.location.href.split('/')[6]
});

