import Component from '@ember/component';
import SurveyTemplate from '../models/survey-template';

export default Component.extend({
  statuses: SurveyTemplate.STATUSES,

  actions: {
    setStatus(status) {
      let surveyTemplate = this.get('surveyTemplate');
      surveyTemplate.set('status', status);
    }
  }
});
