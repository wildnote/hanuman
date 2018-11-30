import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent, isBlank } from '@ember/utils';
import { task, all } from 'ember-concurrency';

export default Component.extend({
  remodal: service(),
  ajax: service(),
  notify: service(),

  init() {
    this._super(...arguments);
    this.setProperties({
      addedTags: A(),
      removedTags: A(),
      availableTags: []
    });
  },

  hasChanges: computed('addedTags.[]', 'filteredTags.[]', 'removedTags.[]', 'searchTerm', function() {
    let addedTags = this.get('addedTags');
    let removedTags = this.get('removedTags');
    let filteredTags = this.get('filteredTags');
    let searchTerm = this.get('searchTerm');
    if (isBlank(filteredTags) && isPresent(searchTerm)) {
      return true;
    }
    return isPresent(addedTags) || isPresent(removedTags);
  }),

  fetchAvailableTags: task(function*() {
    if (isPresent(this.get('availableTags'))) {
      return;
    }
    let surveyTemplateId = this.get('surveyTemplate.id');
    let tagsResult = yield this.get('ajax').request(`/survey_templates/${surveyTemplateId}/available_tags`);
    this.set('availableTags', new Set(tagsResult.tags));
    this.set('filteredTags', tagsResult.tags);
  }).drop(),

  saveQuestions: task(function*() {
    let selectedQuestions = this.get('selectedQuestions');
    let filteredTags = this.get('filteredTags');
    let addedTags = A();
    let removedTags = A();
    if (isBlank(filteredTags)) {
      addedTags = A([this.get('searchTerm').trim()]);
    } else {
      addedTags = this.get('addedTags');
      removedTags = this.get('removedTags');
    }

    selectedQuestions.forEach(function(question) {
      let currentTags = A(question.get('tags'));
      currentTags.addObjects(addedTags);
      currentTags.removeObjects(removedTags);
      question.set('tagList', currentTags.toArray().join(','));
    });

    try {
      yield all(selectedQuestions.map((question) => question.save()));
      this.cleanAndClose();
      this.get('notify').success('Questions successfully tagged');
    } catch (e) {
      this.get('notify').alert(e);
    }
  }).drop(),

  cleanAndClose() {
    this.get('remodal')
      .close('tagging-modal')
      .then(() => {
        this.get('unSelectAll')();
        this.set('showingModal', false);
      });
  },

  actions: {
    save() {
      this.get('saveQuestions').perform();
    },

    closeModal() {
      this.cleanAndClose();
    },

    searchTag() {
      let availableTags = [...this.get('availableTags')];
      let searchTerm = this.get('searchTerm');
      if (isPresent(searchTerm)) {
        let result = availableTags.filter((tag) => tag.includes(searchTerm));
        this.set('filteredTags', result);
      } else {
        this.set('filteredTags', availableTags);
      }
    }
  }
});
