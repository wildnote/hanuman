import Ember from 'ember';
import SurveyTemplate from "../../../../models/survey-template";

const {
  computed: { alias, sort }
} = Ember;

export default Ember.Controller.extend({
  surveyTemplate: alias('model'),
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
