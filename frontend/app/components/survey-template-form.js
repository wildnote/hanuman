import Ember from 'ember';
import SurveyTemplate from "../models/survey-template";

const {
  computed: { sort }
} = Ember;

export default Ember.Component.extend({
  statuses: SurveyTemplate.STATUSES,
  sortOrganizationsBy: ['name'],
  sortedOrganizations: sort('organizations', 'sortOrganizationsBy'),

  actions: {
    setStatus(status){
      let surveyTemplate = this.get('surveyTemplate');
      surveyTemplate.set('status',status);
    }
  }
});
