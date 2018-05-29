import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';
import { memberAction } from 'ember-api-actions';
import { filterBy } from '@ember/object/computed';

// Constants
const STATUSES = ['draft', 'active', 'inactive'];

const SurveyTemplate = Model.extend(Validator, {
  // Attributes
  name: attr('string'),
  status: attr('string', { defaultValue: 'draft' }),
  surveyType: attr('string'),
  fullyEditable: attr('boolean'),
  duplicatorLabel: attr('string'),
  // Wildnote specific data
  lock: attr('boolean'),
  version: attr('string'),
  description: attr('string'),
  // Custom hack for Wildnote
  organizationId: attr('number'),
  surveyTemplateExportTypeId: attr('number'),

  // Relations
  questions: hasMany('question'),
  // Computed
  questionsNotNew: filterBy('questions', 'isNew', false),
  filteredquestions: filterBy('questionsNotNew', 'isDeleted', false),

  // Custom actions
  duplicate: memberAction({ path: 'duplicate', type: 'post' }),

  // Validations
  validations: {
    name: {
      presence: true
    },
    status: {
      inclusion: {
        in: STATUSES
      }
    }
  }
});

SurveyTemplate.reopenClass({
  STATUSES
});

export default SurveyTemplate;
