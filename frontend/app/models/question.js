import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { bool, equal, filterBy, match } from '@ember/object/computed';
import { memberAction } from 'ember-api-actions';
import { isPresent } from '@ember/utils';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  // Accessors
  loading: false,
  ancestrySelected: false,
  ancestryCollapsed: false,
  collapsed: false,
  highlighted: false,
  pendingRecursive: 0,

  // Attributes
  questionText: attr('string'),
  sortOrder: attr('number'),
  required: attr('boolean'),
  externalDataSource: attr('string'),
  hidden: attr('boolean'),
  ancestry: attr('string'),
  parentId: attr('string'),
  helperText: attr('string'),
  railsId: attr('number'),

  captureLocationData: attr('boolean'),
  enableSurveyHistory: attr('boolean'),
  tagList: attr('string', { defaultValue: '' }),
  combineLatlongAsPolygon: attr('boolean'),
  combineLatlongAsLine: attr('boolean'),
  newProjectLocation: attr('boolean'),
  layoutSection: attr('number'),
  layoutRow: attr('number'),
  layoutColumn: attr('number'),
  maxPhotos: attr('number'),
  layoutColumnPosition: attr('string'),
  defaultAnswer: attr('string'),
  exportContinuationCharacters: attr('number'),
  dbColumnName: attr('string'),
  apiColumnName: attr('string'),
  cssStyle: attr('string'),
  reportChildrenWidth: attr('number'),
  flaggedAnswers: attr('string'),
  convertToUtm: attr('boolean'),
  reportLabel: attr('string'),
  excludeFromReport: attr('boolean'),
  calculated: attr('boolean'),

  // Associations
  dataSource: belongsTo('data-source'),
  answerType: belongsTo('answer-type'),
  surveyTemplate: belongsTo('survey-template'),
  rules: hasMany('rule', { async: false }),
  answerChoices: hasMany('answer-choice', { async: false }),
  childIds: attr('array'),
  lookupRules: filterBy('rules', 'type', 'Hanuman::LookupRule'),

  // Computed Properties
  childQuestion: bool('ancestry'),
  isContainer: equal('answerType.name', 'section'),
  isARepeater: equal('answerType.name', 'repeater'),
  isLocationSelect: equal('answerType.name', 'locationchosensingleselect'),
  isTextField: equal('answerType.name', 'text'),
  isTextAreaField: equal('answerType.name', 'textarea'),

  supportAncestry: match('answerType.name', /section|repeater/),
  isTaxonType: match('answerType.name', /taxon/),

  displayDataInRepeaterHeader: attr('boolean'),

  cssStyleDisplay: computed('cssStyle', function() {
    let styleString = this.get('cssStyle') || '';
    return styleString.split(';').join(';\n');
  }),

  tags: computed('tagList', function() {
    let tagList = this.get('tagList') || '';
    return tagList.split(',').filter(Boolean);
  }),

  visibilityRule: computed('rules.@each.type', function() {
    return this.get('rules').find((rule) => rule.type === 'Hanuman::VisibilityRule');
  }),

  calculationRule: computed('rules.@each.type', function() {
    return this.get('rules').find((rule) => rule.type === 'Hanuman::CalculationRule');
  }),

  hasChild: computed('childIds.[]', function() {
    return isPresent(this.get('childIds'));
  }),

  child: computed('childIds.[]', function() {
    let childIds = this.get('childIds').map((id) => `${id}`);
    return this.store.peekAll('question').filter(function(q) {
      return this.indexOf(q.get('id')) !== -1;
    }, childIds);
  }),

  parent: computed('parentId', function() {
    return this.store
      .peekAll('question')
      .filterBy('id', this.parentId)
      .get(0);
  }),

  isinRepeater: computed('parentId', function() {
    if (this.get('parent') && this.get('parent').get('isARepeater')) {
      return 1;
    } else {
      return 0;
    }
  }),

  hasDefaultAnswer: computed('defaultAnswer', function() {
    return isPresent(this.get('defaultAnswer'));
  }),

  canBeDisplayedInRepeater: computed('canBeDisplayedInRepeater', 'answerType.name', function() {
    let allowableTypes = [
      'checkbox',
      'number',
      'radio',
      'text',
      'date',
      'time',
      'chosenselect',
      'locationchosensingleselect',
      'taxonchosensingleselect',
      'counter'
    ];
    return allowableTypes.includes(this.get('answerType').get('name'));
  }),

  numChildren: computed('childQuestion', function() {
    if (this.get('childQuestion')) {
      return this.get('ancestry').split('/').length;
    } else {
      return 0;
    }
  }),

  ruleMatchType: computed('visibilityRule', 'visibilityRule.matchType', function() {
    if (this.visibilityRule) {
      return this.visibilityRule.get('matchType') === 'all' ? 'AND' : 'OR';
    }
  }),

  answerChoicesCount: computed('answerChoices.[]', function() {
    if (this.hasMany('answerChoices').value() === null) {
      return 0;
    }

    return this.hasMany('answerChoices').ids().length;
  }),

  defaultAnswerEnabled: computed('defaultAnswerEnabled', 'answerType.name', function() {
    let allowableTypes = ['checkbox', 'number', 'radio', 'text', 'textarea'];
    return allowableTypes.includes(this.get('answerType').get('name'));
  }),

  // Check for incomplete rules (rules with no conditions)
  hasIncompleteRules: computed('rules.@each.{conditions,conditionsPendingSave}', function() {
    const rules = this.get('rules') || [];

    // If there are no rules at all, there are no incomplete rules
    if (rules.length === 0) {
      return false;
    }

    return rules.any((rule) => {
      const savedConditions = rule.get('conditions') || [];
      const pendingConditions = rule.get('conditionsPendingSave') || [];
      const totalConditions = savedConditions.length + pendingConditions.length;
      return totalConditions === 0;
    });
  }),

  // Get incomplete rules for display purposes
  incompleteRules: computed('rules.@each.{conditions,conditionsPendingSave}', function() {
    const rules = this.get('rules') || [];
    return rules.filter((rule) => {
      const savedConditions = rule.get('conditions') || [];
      const pendingConditions = rule.get('conditionsPendingSave') || [];
      const totalConditions = savedConditions.length + pendingConditions.length;
      return totalConditions === 0;
    });
  }),

  // Custom actions
  duplicate: memberAction({ path: 'duplicate', type: 'post' }),
  processQuestionChanges: memberAction({ path: 'process_question_changes', type: 'post' }),

  // Validations
  validations: {
    questionText: {
      presence: true
    },
    answerType: {
      presence: true,
      custom: {
        validation(_key, _value, model) {
          if (!model.get('isNew')) {
            let childrenQuestions = model
              .get('surveyTemplate.questions')
              .filterBy('ancestry', model.get('id').toString());
            if (childrenQuestions.length > 0) {
              if (model.get('supportAncestry')) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
        message: 'This question has children questions, therefore the question type must be section or repeater.'
      }
    },
    apiColumnName: {
      custom: {
        validation(_key, value, model) {
          if (!value) return true;
          let surveyTemplate = model.get('surveyTemplate');
          if (!surveyTemplate) return true;
          let questions = surveyTemplate.get('questions');
          let currentId = model.get('id');
          
          // Find the conflicting question
          let conflictingQuestion = questions.find(
            (q) =>
              q.get('id') !== currentId &&
              q.get('apiColumnName') &&
              q.get('apiColumnName').toLowerCase() === value.toLowerCase()
          );
          
          if (conflictingQuestion) {
            // Set the message to include the conflicting question ID
            model.set('_conflictingQuestionId', conflictingQuestion.get('id'));
            return false;
          }
          
          return true;
        },
        message: function() {
          let conflictingId = this.get('_conflictingQuestionId');
          if (conflictingId) {
            return `API Column Name must be unique within this form. Conflicts with question ID: ${conflictingId}`;
          }
          return 'API Column Name must be unique within this form.';
        }
      }
    },
    answerChoices: {
      custom: {
        validation(_key, _value, model) {
          if (model.get('answerType.hasAnswerChoices') && (!model.answerChoices || model.answerChoices.length === 0)) {
            return false;
          }
          return true;
        },
        message: 'Please add at least one answer choice.'
      }
    },
    dataSource: {
      presence: {
        if(object, validator, model) {
          return model.get('isTaxonType');
        }
      }
    },
    rules: {
      custom: {
        validation(_key, _value, model) {
          const rules = model.get('rules') || [];

          // If there are no rules at all, that's fine
          if (rules.length === 0) {
            return true;
          }

          // Check if any rules have no conditions
          const incompleteRules = rules.filter((rule) => {
            const savedConditions = rule.get('conditions') || [];
            const pendingConditions = rule.get('conditionsPendingSave') || [];
            const totalConditions = savedConditions.length + pendingConditions.length;
            return totalConditions === 0;
          });

          return incompleteRules.length === 0;
        },
        message: 'Rules must have at least one condition.'
      }
    }
  }
});
