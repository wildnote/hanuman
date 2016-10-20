import Ember from 'ember';

const { inject } = Ember;

export default Ember.Mixin.create({
  ajax: inject.service(),
  setupController(controller, model) {
    this._super(controller, model);
    return this.get('ajax').request('/organizations').then((response) =>{
      return controller.set('organizations', response.organizations);
    });
  },
  actions: {
    save(){
      let surveyTemplate = this.currentModel;
      if(surveyTemplate.validate()){
        surveyTemplate.save().then(
          // Success
          (surveyTemplate)=>{
            this.transitionTo('survey_templates.record', surveyTemplate);
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
