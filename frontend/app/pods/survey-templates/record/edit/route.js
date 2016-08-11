import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    save(){
      let surveyTemplate = this.currentModel;
      if(surveyTemplate.validate()){
        surveyTemplate.save().then(
          // Success
          (surveyTemplate)=>{
            this.transitionTo('survey_templates.record',surveyTemplate);
          },
          // Error
          (error)=>{
            console.error(error);
          }
        );
      }
    }
  }
});
