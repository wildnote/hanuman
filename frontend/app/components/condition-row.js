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
  classNames: ['condition-row'],
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
      try {
        // Add timeout to prevent hanging on large datasets
        const response = yield this.ajax.request(`/locations?project_id=${projectId}`, {
          timeout: 30000 // 30 second timeout
        });
        this.set('locations', response.locations || []);
      } catch (error) {
        console.error('Error loading locations:', error);
        this.set('locations', []);
        // Set an error state that can be displayed in the template
        this.set('locationsError', 'Failed to load locations. Please try again.');
      }
    } else {
      this.set('locations', []);
    }
  }),

  loadDataSources: task(function*() {
    const currentQuestion = this.get('currentQuestion');
    const dataSourceId = currentQuestion.belongsTo('dataSource').id();
    if (dataSourceId) {
      try {
        // Add timeout to prevent hanging on large datasets
        const response = yield this.ajax.request(`/data_sources/${dataSourceId}/data_source_taxon_mappings`, {
          timeout: 30000 // 30 second timeout
        });
        this.set('dataSources', response.data_source_taxon_mappings || []);
      } catch (error) {
        console.error('Error loading data sources:', error);
        this.set('dataSources', []);
        // Set an error state that can be displayed in the template
        this.set('dataSourcesError', 'Failed to load data sources. Please try again.');
      }
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
    const answerChoices = this.get('currentQuestion.answerChoices');
    return answerChoices;
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

    // Only trigger loads if we don't already have the data and we're not already loading
    if (currentQuestion.isLocationSelect && isBlank(this.locations) && !this.loadLocations.isRunning) {
      this.loadLocations.perform();
    }
    if (currentQuestion.isTaxonType && isBlank(this.dataSources) && !this.loadDataSources.isRunning) {
      this.loadDataSources.perform();
    }
    return value;
  }),

  showAnswerField: computed('condition.operator', function() {
    // Don't show answer field for operators that don't need answers
    return !Condition.OPERATORS_WITHOUT_ANSWER.includes(this.get('condition.operator'));
  }),

  showAnswerInDisplay: computed('condition.operator', function() {
    // Don't show answer field for operators that don't need answers
    return !Condition.OPERATORS_WITHOUT_ANSWER.includes(this.get('condition.operator'));
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

    cancel() {
      let condition = this.get('condition');
      // If this is a new condition that was cancelled, remove it from pending save
      if (this.get('isNewCondition') && condition) {
        let rule = this.get('rule');
        let conditionsPendingSave = rule.get('conditionsPendingSave') || [];
        conditionsPendingSave.removeObject(condition);
        condition.deleteRecord();
      }
      this.send('toggleForm');
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
      } else {
        console.log('Validation failed:', condition.errors);
      }
    },

    delete() {
      let condition = this.get('condition');
      this.removeTask.perform(condition, this.rule);
    },

    setConditionOperator(operator) {
      this.set('condition.operator', operator);

      // Clear answer field if switching to an operator that doesn't need an answer
      if (Condition.OPERATORS_WITHOUT_ANSWER.includes(operator)) {
        this.set('condition.answer', '');
      }
    },
    setConditionQuestion(questionId) {
      this.set('condition.questionId', questionId);
      // Clear any previous error states when switching questions
      this.set('locationsError', null);
      this.set('dataSourcesError', null);
    },
    setConditionAnswer(answer) {
      this.set('condition.answer', answer);
    }
  }
});
