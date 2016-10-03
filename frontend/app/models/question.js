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
  // Attributes
  questionText: attr('string'),
  sortOrder: attr('number'),
  required: attr('boolean'),
  externalDataSource: attr('string'),
  hidden: attr('boolean'),
  ancestry: attr('string'),
  parentId: attr('string'),
  railsId: attr('number'),

  // Associations
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
  supportAncestry: match('answerType.name', /section|repeater/),

  // Validations
  validations: {
    questionText:{
      presence: true
    },
    answerType:{
      presence: true
    }
  }
});
