import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

const {
  computed: { filterBy }
} = Ember;

const STATUSES = ['draft', 'active', 'inactive'];

const SurveyTemplate = Model.extend(Validator, {
  // Attributes
  name: attr('string'),
  status: attr('string'),
  surveyType: attr('string'),
  fullyEditable: attr('boolean'),
  duplicatorLabel: attr('string'),
  // Custom hack for Wildnote
  organizationId: attr('number'),

  // Relations
  questions: hasMany('question'),
  // Computed
  questionsNotNew: filterBy('questions', 'isNew', false),
  filteredquestions: filterBy('questionsNotNew', 'isDeleted', false),

  // Validations
  validations: {
    name:{
      presence: true
    },
    status:{
      inclusion: {
        in: STATUSES
      }
    }
  }
});

SurveyTemplate.reopenClass({
  STATUSES: STATUSES
});

export default SurveyTemplate;