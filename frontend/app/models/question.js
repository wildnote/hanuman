import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { match, equal, bool } from '@ember/object/computed';
import { memberAction } from 'ember-api-actions';
import Validator from './../mixins/model-validator';

export default Model.extend(Validator, {
  // Accessors
  loading: attr('boolean', { defaultValue: false }),

  // Attributes
  questionText: attr('string'),
  sortOrder: attr('number'),
  required: attr('boolean'),
  externalDataSource: attr('string'),
  hidden: attr('boolean'),
  ancestry: attr('string'),
  parentId: attr('string'),
  railsId: attr('number'),
  captureLocationData: attr('boolean'),
  combineLatlongAsPolygon: attr('boolean'),
  combineLatlongAsLine: attr('boolean'),

  // Associations
  dataSource: belongsTo('data-source'),
  answerType: belongsTo('answer-type'),
  surveyTemplate: belongsTo('survey-template'),
  rule: belongsTo('rule', { async: false }),
  answerChoices: hasMany('answer-choice'),

  // Computed Properties
  childQuestion: bool('ancestry'),
  isContainer: equal('answerType.name', 'section'),
  isARepeater: equal('answerType.name', 'repeater'),
  numChildren: computed('childQuestion', function() {
    if (this.get('childQuestion')) {
      return this.get('ancestry').split('/').length;
    } else {
      return 0;
    }
  }),
  ruleMatchType: computed('rule.matchType', function() {
    let rule = this.get('rule');
    return (rule.get('matchType') === 'all') ? 'AND' : 'OR';
  }),

  answerChoicesCount: computed('answerChoices.[]', function() {
    if (this.hasMany('answerChoices').value() === null) {
      return 0;
    }

    return this.hasMany('answerChoices').ids().length;
  }),

  supportAncestry: match('answerType.name', /section|repeater/),
  isTaxonType: match('answerType.name', /taxon/),

  // Custom actions
  duplicate: memberAction({ path: 'duplicate', type: 'post' }),

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
            let childrenQuestions = model.get('surveyTemplate.questions').filterBy('ancestry', model.get('id').toString());
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
