import Ember from 'ember';

const {
  Mixin,
  inject
} = Ember;

export default Mixin.create({
  ajax: inject.service(),
  notify: inject.service('notify'),
  setupController(controller, model) {
    this._super(controller, model);
    return this.get('ajax').request('/organizations').then((response) =>{
      return controller.set('organizations', response.organizations);
    });
  },
  actions: {
    save() {
      let surveyTemplate = this.currentModel;
      if (surveyTemplate.validate()) {
        surveyTemplate.save().then(
          // Success
          (surveyTemplate) => {
            this.transitionTo('survey_templates.record', surveyTemplate);
          },
          // Error
          (_error) => {
            this.get('notify').alert('There was an error trying to save this Survey Template');
          }
        );
      }
    }
  }
});
