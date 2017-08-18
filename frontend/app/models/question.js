import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Validator from './../mixins/model-validator';

const {
  computed,
  computed: { bool, equal, match }
} = Ember;

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

  // Associations
  dataSource:     belongsTo('data-source'),
  answerType:     belongsTo('answer-type'),
  surveyTemplate: belongsTo('survey-template'),
  rule:           belongsTo('rule', {async: false}),
  answerChoices:  hasMany('answer-choice'),

  // Computed Properties
  childQuestion:  bool('ancestry'),
  isContainer:    equal('answerType.name', 'section'),
  numChildren:    computed('childQuestion', function() {
    if(this.get('childQuestion')){
      return this.get('ancestry').split('/').length;
    }else{
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

  // Validations
  validations: {
    questionText:{
      presence: true
    },
    answerType:{
      presence: true
    },
    answerChoices: {
      custom: {
        validation: function(_key, _value, model){
          let hasAnswerChoices = model.get('answerType.hasAnswerChoices');
          return hasAnswerChoices && model.get('answerChoicesCount') === 0 ? false : true;
        },
        message: 'Please add at least one answers choice.'
      }
    },
    dataSource: {
      presence: {
        'if': function(object, validator, model) {
          return model.get('isTaxonType');
        }
      }
    }
  }
});
