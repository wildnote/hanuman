import Ember from 'ember';
import SurveyTemplate from "../../../../models/survey-template";

const {
  computed: { alias }
} = Ember;

export default Ember.Controller.extend({
  surveyTemplate: alias('model'),
  statuses: SurveyTemplate.STATUSES,

  actions: {
    setStatus(status){
      let surveyTemplate = this.get('surveyTemplate');
      surveyTemplate.set('status',status);
    }
  }
});
