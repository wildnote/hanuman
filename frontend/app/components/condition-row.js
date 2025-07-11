import { isBlank, isNone } from '@ember/utils';

import Component from '@ember/component';
import Condition from '../models/condition';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import config from 'frontend/config/environment';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

const testing = config.environment === 'test';

export default Component.extend({
  ajax: service(),
  for: alias('condition'),
  tagName: 'tr',
  attributeBindings: ['condition.id:data-condition-id'],
  classNameBindings: ['isNewCondition:no-hover'],
  isEditingCondition: false,

  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, function() {
      if (
        this.condition &&
        isBlank(this.condition.questionId) &&
        this.availableQuestions &&
        this.availableQuestions[0]
      ) {
        this.set('condition.questionId', this.availableQuestions[0].id);
      }

      // Ensure data for answer dropdowns is loaded after currentQuestion is established
      const currentQuestion = this.get('currentQuestion');
      if (currentQuestion) {
        if (currentQuestion.isLocationSelect && isBlank(this.locations)) {
          this.loadLocations.perform();
        }
        if (currentQuestion.isTaxonType) {
          // Assuming dataSources load has internal checks or is safe to call
          this.loadDataSources.perform();
        }
      }
    });
  },

  loadLocations: task(function*() {
    let projectId;
    if (window.location.href.indexOf('/projects/') !== -1) {
      projectId = window.location.href.split('/')[6];
    }
    if (projectId || testing) {
      const response = yield this.ajax.request(`/locations?project_id=${projectId}`);
      this.set('locations', response.locations);
    } else {
      this.set('locations', []);
    }
  }),

  loadDataSources: task(function*() {
    const currentQuestion = this.get('currentQuestion');
    const dataSourceId = currentQuestion.belongsTo('dataSource').id();
    if (dataSourceId) {
      const response = yield this.ajax.request(`/data_sources/${dataSourceId}/data_source_taxon_mappings`);
      this.set('dataSources', response.data_sources);
    } else {
      this.set('dataSources', []);
    }
  }),

  availableQuestions: computed('rule', 'question.@each.answerType.name', function() {
    const ruleQuestion = this.get('rule.question');
    if (this.rule.get('type') === 'Hanuman::LookupRule') {
      const supportedQuestionForLookup = [
        'checkbox',
        'checkboxlist',
        'chosenmultiselect',
        'chosenselect',
        'locationchosensingleselect',
        'radio',
        'taxonchosenmultiselect',
        'taxonchosensingleselect'
      ];
      return this.questions.filter((question) => {
        if (supportedQuestionForLookup.includes(question.get('answerType.name'))) {
          if (question.get('parent') && question.get('parent').get('isARepeater')) {
            return question.get('ancestry') === ruleQuestion.get('ancestry');
          }
          return true;
        }
        return false;
      });
    }
    return this.questions.filter((question) => {
      // Disallow calculation rules that would end up creating a state of infinite recursion
      if (question.get('calculationRule')) {
        const conditions = question.get('calculationRule').get('conditions');
        let recursive = false;
        conditions.forEach((condition) => {
          if (condition.get('questionId') === ruleQuestion.get('railsId').toString()) {
            recursive = true;
          }
        });

        if (recursive) {
          return false;
        }
      }

      return true;
    });
  }),

  operators: computed('currentQuestion', function() {
    let answerType = this.get('currentQuestion.answerType');
    if (['checkboxes', 'multiselect'].includes(answerType.get('elementType'))) {
      return Condition.OPERATORS.filter(function(op) {
        return op.includes('equal');
      });
    } else {
      return Condition.OPERATORS;
    }
  }),

  currentQuestion: computed('condition.questionId', function() {
    return this.get('questions').findBy('id', this.get('condition.questionId'));
  }),

  questionAnswerChoices: computed('currentQuestion', function() {
    return this.get('currentQuestion.answerChoices');
  }),

  useDropDownAnswerSelect: computed('currentQuestion', 'condition.operator', function() {
    let currentQuestion = this.get('currentQuestion');
    let conditionOperator = this.get('condition.operator');
    let value =
      conditionOperator !== 'contains' &&
      currentQuestion &&
      (currentQuestion.hasMany('answerChoices').ids().length > 1 ||
        currentQuestion.isLocationSelect ||
        currentQuestion.isTaxonType);
    if (currentQuestion.isLocationSelect && isBlank(this.locations)) {
      this.loadLocations.perform();
    }
    if (currentQuestion.isTaxonType) {
      this.loadDataSources.perform();
    }
    return value;
  }),

  setNewCondition() {
    let condition = this.get('question').store.createRecord('condition', {
      questionId: this.get('questions.firstObject.id'),
      rule: this.rule
    });
    this.set('condition', condition);
  },

  actions: {
    toggleForm(addNew) {
      this.toggleProperty('isEditingCondition');
      if (isNone(this.get('condition')) && addNew) {
        this.setNewCondition();
      }
    },

    save() {
      let condition = this.get('condition');

      // Strip any trailing spaces off of a condition answer before saving it.
      let answer = condition.get('answer') || '';
      condition.set('answer', answer.trim());

      if (condition.validate()) {
        condition.set('rule', this.rule);
        this.saveTask.perform(condition, this.rule);
        if (this.get('isNewCondition')) {
          this.set('condition', null);
        }
        this.send('toggleForm');
      }
    },

    delete() {
      let condition = this.get('condition');
      this.removeTask.perform(condition, this.rule);
    },

    setConditionOperator(operator) {
      this.set('condition.operator', operator);
    },
    setConditionQuestion(questionId) {
      this.set('condition.questionId', questionId);
    },
    setConditionAnswer(answer) {
      this.set('condition.answer', answer);
    }
  }
});
