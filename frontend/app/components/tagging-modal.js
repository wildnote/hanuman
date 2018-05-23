import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { task, all } from 'ember-concurrency';

export default Component.extend({
  remodal: service(),
  ajax: service(),
  notify: service(),

  init() {
    this._super(...arguments);
    this.set('selectedTags', []);
    this.set('availableTags', []);
  },

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
    let selectedTags = this.get('selectedTags');
    let tags = isPresent(selectedTags) ? selectedTags.join(',') : this.get('searchTerm').trim();

    selectedQuestions.forEach(function(question) {
      let currentTags = question
        .get('tagList')
        .split(',')
        .filter((tag) => isPresent(tag));
      currentTags.push(tags);
      question.set('tagList', currentTags.join(','));
    });

    try {
      yield all(selectedQuestions.map((question) => question.save()));
      // add just created tags
      let availableTags = this.get('availableTags');
      tags.split(',').forEach((tag) => availableTags.add(tag));
      this.cleanAndClose();
      this.get('notify').success('Questions successfully tagged');
    } catch(e) {
      this.get('notify').alert(e);
    }
  }).drop(),

  cleanAndClose() {
    this.get('remodal')
      .close('tagging-modal')
      .then(() => {
        let availableTags = [...this.get('availableTags')];
        this.set('filteredTags', availableTags);
        this.set('searchTerm', '');
        this.get('unSelectAll')();
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
