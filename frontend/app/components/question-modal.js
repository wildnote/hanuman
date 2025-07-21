import Ember from 'ember';
import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { observer, computed, set } from '@ember/object';
import { on } from '@ember/object/evented';
import { equal, sort, alias } from '@ember/object/computed';
import { task, allSettled } from 'ember-concurrency';
import { bind } from '@ember/runloop';
import groupBy from 'ember-group-by';
import window from 'ember-window-mock';
import $ from 'jquery';

const { testing } = Ember;

export default Component.extend({
  remodal: service(),
  store: service(),

  isFullyEditable: alias('surveyTemplate.fullyEditable'),
  showAnswerChoices: alias('question.answerType.hasAnswerChoices'),
  hasAnAnswer: alias('question.answerType.hasAnAnswer'),
  isALatLong: equal('question.answerType.name', 'latlong'),
  isPhoto: equal('question.answerType.name', 'photo'),
  sortTypesBy: ['displayName'],
  sortedAnswerTypes: sort('answerTypes', 'sortTypesBy'),
  groupedAnswerTypes: groupBy('sortedAnswerTypes', 'groupType'),

  // Custom order for answer type groups
  sortedGroupedAnswerTypes: computed('groupedAnswerTypes.[]', function() {
    const groupedAnswerTypes = this.get('groupedAnswerTypes');

    return groupedAnswerTypes.sortBy('value'); // Sort alphabetically by group name
  }),

  init() {
    this._super(...arguments);
    this.setProperties({
      answerChoicesPendingSave: [],
      hasInvalidConditions: false
    });
  },

  filteredAnswerTypes: computed('answerTypes', function() {
    const answerTypes = this.get('answerTypes');
    if (this.get('isSuperUser')) {
      return answerTypes;
    }
    return answerTypes.filter((answerType) => {
      return !answerType.get('name').includes('taxon');
    });
  }),

  didInsertElement() {
    this._super(...arguments);

    run.scheduleOnce('afterRender', this, function() {
      this.get('remodal').open('question-modal');

      // Function to initialize popovers when content is ready
      const initializePopovers = () => {
        // Check for popover elements
        const $popovers = $(this.element).find('.bootstrap-popover');

        // Also check in the entire document for popovers that might be in the modal
        const $allPopovers = $('.bootstrap-popover');

        // Check if the modal content is in a different location
        const $modalContent = $('.remodal-wrapper, .remodal, [data-remodal-id="question-modal"]');

        // Check if the modal is actually visible/open
        const $visibleModal = $('.remodal.remodal-is-opened, .remodal.remodal-visible');

        // Use visible modal content if available, otherwise use component element
        const $targetElement = $visibleModal.length > 0 ? $visibleModal : $(this.element);
        const $targetPopovers = $targetElement.find('.bootstrap-popover');

        if ($targetPopovers.length === 0) {
          this.retryCount = (this.retryCount || 0) + 1;

          // Limit retries to prevent infinite loop
          if (this.retryCount > 50) {
            return;
          }

          setTimeout(() => {
            initializePopovers.call(this);
          }, 100);
          return;
        }

        // Use the target popovers instead of the original ones
        const $finalPopovers = $targetPopovers;

        const $dataTogglePopovers = $targetElement.find('[data-toggle="popover"]');

        // Try to initialize popovers
        try {
          $finalPopovers.popover({
            container: 'body',
            html: true
          });

          // Fix z-index issue by setting higher z-index for popovers when they're shown
          $finalPopovers.on('shown.bs.popover', function() {
            const $popover = $('.popover').last(); // Get the most recently shown popover
            const $modal = $('.remodal.remodal-is-opened, .remodal.remodal-visible');
            const modalZIndex = parseInt($modal.css('z-index')) || 0;
            const newZIndex = Math.max(modalZIndex + 10000, 999999);
            $popover.css('z-index', newZIndex);

            // Add scrollable content for tall popovers
            const $content = $popover.find('.popover-content');
            if ($content.height() > 300) {
              $content.css({
                'max-height': '300px',
                'overflow-y': 'auto',
                'padding-right': '10px'
              });
            }
          });

          $dataTogglePopovers.popover({
            container: 'body',
            html: true
          });

          // Fix z-index issue for data-toggle popovers too
          $dataTogglePopovers.on('shown.bs.popover', function() {
            const $popover = $('.popover').last();
            const $modal = $('.remodal.remodal-is-opened, .remodal.remodal-visible');
            const modalZIndex = parseInt($modal.css('z-index')) || 0;
            const newZIndex = Math.max(modalZIndex + 10000, 999999);
            $popover.css('z-index', newZIndex);

            // Add scrollable content for tall popovers
            const $content = $popover.find('.popover-content');
            if ($content.height() > 300) {
              $content.css({
                'max-height': '300px',
                'overflow-y': 'auto',
                'padding-right': '10px'
              });
            }
          });

          // Test click events (for debugging if needed)
          $finalPopovers.on('click', function(e) {
            // Popover click event - can be used for debugging if needed
          });

          // Test manual trigger (removed for production)
        } catch (error) {
          // Silently handle popover initialization errors
        }

        // Handle tabs
        const tabs = this.element.querySelectorAll('a[data-toggle="tab"]');
        tabs.forEach((tab) => {
          tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('href');
            const targetTab = this.element.querySelector(targetId);
            if (targetTab) {
              // Remove active class from all tabs
              tabs.forEach((t) => t.classList.remove('active'));
              // Add active class to clicked tab
              tab.classList.add('active');
              // Show target content
              const tabContents = this.element.querySelectorAll('.tab-pane');
              tabContents.forEach((content) => content.classList.remove('active'));
              targetTab.classList.add('active');
            }
          });
        });
      };

      // Start the initialization process
      setTimeout(initializePopovers, 100);
    });

    document.addEventListener('keydown', bind(this, this._escapeHandler));
  },

  willDestroyElement() {
    document.removeEventListener('keydown', bind(this, this._escapeHandler));
    this._super(...arguments);
  },

  answerChoicesToShow: computed('question.answerChoices.@each.{isNew,isDeleted}', 'question.{isNew}', function() {
    const answerChoices = this.question.get('answerChoices').filter((answerChoice) => !answerChoice.isDeleted);
    if (this.question.isNew) {
      return answerChoices;
    }
    return answerChoices.filter((answerChoice) => !answerChoice.isNew);
  }),

  ancestryQuestions: computed('questions', function() {
    return this.get('questions').filter((question) => {
      const allowedTypes = ['section', 'repeater'];
      return allowedTypes.includes(question.get('answerType.name'));
    });
  }),

  conditionalQuestions: computed('questions', 'question', function() {
    const question = this.get('question');
    return this.get('questions').filter((condQuestion) => {
      return condQuestion !== question && condQuestion.get('answerType.hasAnAnswer');
    });
  }),

  ancestryQuestion: computed('question.parentId', function() {
    return this.get('questions').findBy('id', this.get('question.parentId'));
  }),

  isRequiredDisabled: computed(
    'question.answerType.name',
    'question.visibilityRule.{isNew,conditionsPendingSave.[]}',
    function() {
      const question = this.get('question');
      let newRule = this.get('question.visibilityRule.isNew');
      const notTypes = ['section', 'repeater', 'helperabove', 'helperbelow', 'static', 'line'];
      const pendingConditions = this.get('question.visibilityRule.conditionsPendingSave.length') > 0;
      if (newRule === undefined) {
        newRule = true;
      }
      return !newRule || pendingConditions || notTypes.includes(question.get('answerType.name'));
    }
  ),

  showQuestionTypePlaceholder: computed('question.{isNew,answerType.id}', function() {
    let question = this.get('question');
    return question.get('isNew') && question.get('answerType.id') === undefined;
  }),

  // Check for incomplete lookup rules specifically
  hasIncompleteLookupRules: computed('question.lookupRules.@each.{conditions,conditionsPendingSave}', function() {
    const lookupRules = this.get('question.lookupRules') || [];
    return lookupRules.any((rule) => {
      const savedConditions = rule.get('conditions') || [];
      const pendingConditions = rule.get('conditionsPendingSave') || [];
      const totalConditions = savedConditions.length + pendingConditions.length;
      return totalConditions === 0;
    });
  }),

  // Check for incomplete visibility rules specifically
  hasIncompleteVisibilityRules: computed('question.visibilityRule.{conditions,conditionsPendingSave}', function() {
    const visibilityRule = this.get('question.visibilityRule');
    if (!visibilityRule) return false;

    const savedConditions = visibilityRule.get('conditions') || [];
    const pendingConditions = visibilityRule.get('conditionsPendingSave') || [];
    const totalConditions = savedConditions.length + pendingConditions.length;
    return totalConditions === 0;
  }),

  // If a question has a rule associated with it, it should automatically be set to Hidden
  hideQuestion: on(
    'afterRender',
    observer('question.visibilityRule.{conditions.[],isNew,conditionsPendingSave.[]}', function() {
      let question = this.get('question');
      let newRule = this.get('question.visibilityRule.isNew');
      let hasConditions =
        this.get('question.visibilityRule.conditionsPendingSave.length') > 0 ||
        (question.get('visibilityRule') &&
          question
            .get('visibilityRule')
            .hasMany('conditions')
            .ids().length > 0);
      if (newRule === undefined) {
        newRule = true;
      }
      let toHide = !newRule || hasConditions;
      this.set('question.hidden', toHide);
    })
  ),

  addRule: task(function*(type = 'Hanuman::VisibilityRule') {
    try {
      // We need to save the question first
      yield this.saveTask.perform(true);
      let question = this.question;
      if (!question.isNew) {
        let rule = this.store.createRecord('rule', { question, type });
        yield rule.save();
      }
    } catch (e) {
      console.log('Error saving lookup rule:', e); // eslint-disable-line no-console
    }
  }),

  processQuestionChanges: task(function*() {
    try {
      // disable button because double click can cause problems
      $('#pqc_button')[0].disabled = true;
      // We need to save the question first
      yield this.saveTask.perform(true);
      let question = this.question;
      if (!question.isNew) {
        yield question.processQuestionChanges();
      }
    } catch (e) {
      console.log('Error processing question changes:', e); // eslint-disable-line no-console
    }
  }),

  importAnswerChoices: task(function*() {
    let question = this.get('question');
    // check for question text before saving question
    if (!question.validate()) {
      return;
    }
    yield this.saveTask.perform(true);
    let project_id = document.URL.split('/')[6];
    window.location.pathname = 'project/' + project_id + '/import/answer_choices/' + question.id;
  }),

  saveAnswerChoiceTask: task(function*(answerChoice) {
    let question = this.get('question');
    if (question.get('isNew')) {
      // Save the answer choice after the question is saved
      if (this.get('answerChoicesPendingSave').indexOf(answerChoice) === -1) {
        this.get('answerChoicesPendingSave').pushObject(answerChoice);
      }
    } else {
      answerChoice = yield answerChoice.save();
      if (!question.get('isNew') && question.get('isValid')) {
        yield question.save();
        yield question.reload();
      }
    }
  }),

  saveTask: task(function*(keepOpen = false) {
    let question = this.get('question');
    let surveyTemplate = this.get('surveyTemplate');
    question.set('surveyTemplate', surveyTemplate);

    // Clear any previous validation errors
    this.set('hasInvalidConditions', false);

    // Validate all conditions for all rules before saving
    let allConditionsValid = true;
    let rules = question.get('rules') || [];
    rules.forEach((rule) => {
      let conditions = rule.get('conditions') || [];
      conditions.forEach((condition) => {
        // For calculation rules, we need to allow conditions without answers
        if (rule.get('type') === 'Hanuman::CalculationRule') {
          // Only validate that the condition has a questionId
          if (!condition.get('questionId')) {
            allConditionsValid = false;
          }
        } else {
          // For other rule types, use the standard validation
          if (!condition.validate()) {
            allConditionsValid = false;
          }
        }
      });
    });

    // Set a property to show validation error in template
    this.set('hasInvalidConditions', !allConditionsValid);

    if (!allConditionsValid) {
      return;
    }

    if (!question.validate()) {
      return;
    }

    if (question.get('isNew') && isBlank(question.get('sortOrder'))) {
      question.set('wasNew', true);
      this._sortOrder(question);
    }

    try {
      question = yield question.save();
      yield all(question.get('rules').map((rules) => rules.save()));

      let answerChoicesPendingSave = this.get('answerChoicesPendingSave');
      let answerChoicesPromises = this._pendingObjectsPromises(answerChoicesPendingSave, 'question', question);

      yield this._saveSuccess.perform(question, answerChoicesPromises);

      // Save unsaved related records
      yield allSettled(
        question
          .get('store')
          .peekAll('condition')
          .filter((condition) => condition.isNew)
          .map((condition) => condition.save())
      );

      yield allSettled(
        question
          .get('store')
          .peekAll('answer-choice')
          .filter((answerChoice) => answerChoice.isNew && answerChoice.validate({ addErrors: false }))
          .map((answerChoice) => {
            answerChoice.set('question', question);
            question.get('answerChoices').pushObject(answerChoice);
            return answerChoice.save();
          })
      );

      if (!keepOpen) {
        this.send('closeModal');
      }
    } catch (e) {
      console.log('Error:', e); // eslint-disable-line no-console
      surveyTemplate.get('questions').removeObject(question);
    }
  }),

  _escapeHandler(e) {
    if (e.keyCode == 27) {
      this.send('closeModal');
    }
  },

  _removeAnswerChoices() {
    let answerChoices = this.get('question.answerChoices');
    answerChoices.forEach(function(answerChoice) {
      answerChoice.deleteRecord();
      answerChoice.save();
    });
  },

  _pendingObjectsPromises(pendingObjects, toSet, objTo) {
    for (let pendingObject of pendingObjects) {
      pendingObject.set(toSet, objTo);
    }
    return pendingObjects.invoke('save');
  },

  _saveSuccess: task(function*(question, promises) {
    question = yield question.reload();
    let visibilityRule = question.get('visibilityRule');
    let calculationRule = question.get('calculationRule');
    let answerChoicesPendingSave = this.get('answerChoicesPendingSave');
    let conditionsPendingSave = visibilityRule ? visibilityRule.get('conditionsPendingSave') : [];

    if (calculationRule) {
      conditionsPendingSave = conditionsPendingSave.concat(calculationRule.get('conditionsPendingSave'));
    }

    if (!question.get('answerType.hasAnswerChoices')) {
      this._removeAnswerChoices();
    }
    promises = $.makeArray(promises);
    yield all(promises);
    while (answerChoicesPendingSave.length > 0) {
      answerChoicesPendingSave.popObject();
    }
    while (conditionsPendingSave.length > 0) {
      conditionsPendingSave.popObject();
    }
  }),

  _sortOrder(question) {
    let surveyTemplate = this.get('surveyTemplate');
    let lastQuestion = surveyTemplate
      .get('questions')
      .sortBy('sortOrder')
      .get('lastObject');
    question.set('sortOrder', 1);
    if (lastQuestion && lastQuestion !== question) {
      question.set('sortOrder', lastQuestion.get('sortOrder') + 1);
    }
  },

  actions: {
    checkDefaultAnswer(_value) {
      // this method is not called anywhere
      // if (equal('question.answerType.name', 'number')) {
      //   value = value.replace(/[^0-9.-]/g, '').replace(/(\..*)\./g, '$1').replace(/(?!^)-/g, ''); // only allow positive and negative numbers and decimals
      //   set(this.question, 'defaultAnswer', value);
      //   $('[name='defaultAnswer']').val(value);
      // }
      // for some reason both number and counter are getting into the first condition block whether it's the above or the below
      // if (equal('question.answerType.name', 'counter')) {
      //   value = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, ''); // only allow positive and negative integers
      //   set(this.question, 'defaultAnswer', value);
      //   $('[name='defaultAnswer']').val(value);
      // }
    },

    setReportChildrenWidth(value) {
      value = value.replace(/\D+/g, '');
      value = value.replace(/\b0\b/g, '');
      if (value > 100 || value < 0) value = '';
      set(this.question, 'reportChildrenWidth', value);
      $('[name="reportChildrenWidth"]').val(value);
    },

    setMaxPhotoValue(value) {
      value = value.replace(/\D+/g, '');
      value = value.replace(/\b0\b/g, ''); // replace standalone 0 with 1
      set(this.question, 'maxPhotos', value);
      $('[name="maxPhotos"]').val(value);
    },

    setQuestionText(questionText) {
      if (this.question.isARepeater || this.question.isContainer) {
        questionText = questionText.replace(/[\/\*\[\]:\?\\]/g, ''); // eslint-disable-line no-useless-escape
      }
      set(this.question, 'questionText', questionText);
      $('[name="questionText"]').val(questionText);
    },

    sortAnswerChoices() {
      let question = this.get('question');
      let answerChoices = question.get('answerChoices');

      // Update sort orders based on current array position
      answerChoices.forEach((answerChoice, index) => {
        const newSortOrder = index + 1;
        if (answerChoice.get('sortOrder') !== newSortOrder) {
          answerChoice.set('sortOrder', newSortOrder);
          // Save the answer choice to persist the sort order change
          if (!answerChoice.get('isNew')) {
            answerChoice.save();
          }
        }
      });
    },

    ancestryChange(newAncestryId) {
      let question = this.get('question');
      if (isBlank(newAncestryId)) {
        newAncestryId = null;
      }
      question.set('parentId', newAncestryId);
    },

    setAnswerType(answerTypeId) {
      let answerType = this.get('answerTypes').findBy('id', answerTypeId);
      this.set('question.answerType', answerType);
      $('input[name=questionText]').focus();
    },

    // if answerType is set to anything other than Taxon single or multislect make sure data_source_id is cleared out
    checkToResetDataSource(answerTypeId) {
      if (answerTypeId != 53 || answerTypeId != 58) {
        this.set('question.dataSource', null);
      }
    },

    setDataSource(dataSourceId) {
      let dataSource = this.get('dataSources').findBy('id', dataSourceId);
      this.set('question.dataSource', dataSource);
    },

    closeModal() {
      let question = this.get('question');
      if (
        !question.get('hasDirtyAttributes') ||
        window.confirm('You will lose any unsaved changes. Are you sure you want to continue?')
      ) {
        if (question.get('hasDirtyAttributes')) {
          question.rollbackAttributes();
        }
        this.set('answerChoicesPendingSave', []);
        question
          .get('store')
          .peekAll('answer-choice')
          .filter((answerChoice) => answerChoice.isNew)
          .forEach((answerChoice) => answerChoice.destroyRecord());
        this.get('remodal').close('question-modal');
        this.get('transitionToSurveyStep')();
        if (question.get('wasNew')) {
          if (testing) {
            return question.set('wasNew', false);
          }
          run.later(
            this,
            () => {
              $('html, body').animate({ scrollTop: $('.li-question.row.sortable-item:last').offset().top }, 500);
            },
            500
          );
          // Question is no longer new after showing the visual effect.
          run.later(
            this,
            function() {
              question.set('wasNew', false);
            },
            1500
          );
        }
      }
    },

    // Clear invalid conditions error when conditions are updated
    clearInvalidConditionsError() {
      this.set('hasInvalidConditions', false);
    }
  }
});
