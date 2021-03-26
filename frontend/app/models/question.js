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
  isLatLong: equal('answerType.name', 'latlong'),
  isTextField: equal('answerType.name', 'text'),

  supportAncestry: match('answerType.name', /section|repeater/),
  isTaxonType: match('answerType.name', /taxon/),

  cssStyleDisplay: computed('cssStyle', function () {
    let styleString = this.get('cssStyle') || '';
    return styleString.split(';').join(";\n");
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
    return this.store.peekAll('question').filterBy('id', this.parentId).get(0);
  }),

  // inRepeater: computed('parentId', function () {
  //
  // }),

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
    let allowableTypes = [
      'checkbox',
      'number',
      'radio',
      'text',
      'textarea',
    ];
    return allowableTypes.includes(this.get('answerType').get('name'));
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
    answerChoices: {
      custom: {
        validation(_key, _value, model) {
          let hasAnswerChoices = model.get('answerType.hasAnswerChoices');
          return hasAnswerChoices && model.get('answerChoicesCount') === 0 ? false : true;
        },
        message: 'Please add at least one answers choice.'
      }
    },
    dataSource: {
      presence: {
        if(object, validator, model) {
          return model.get('isTaxonType');
        }
      }
    }
  }
});
