import Controller from '@ember/controller';
import $ from 'jquery';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  surveyTemplate: alias('model'),
  actions: {
    toggleBtnLoading(type) {
      let $btnSurveyLink = $(`#${type}-survey-link`);
      let $btnSurveySpan = $(`#${type}-survey-link span.glyphicons`);
      let loadingConfig = {
        duplicate: {
          text: 'Duplicate Survey',
          loadingText: 'Duplicating...',
          icon: 'glyphicons-duplicate'
        },
        delete: {
          text: 'Delete Survey',
          loadingText: 'Deleting...',
          icon: 'glyphicons-bin'
        }
      };
      if ($btnSurveyLink.hasClass('disabled')) {
        $btnSurveySpan.attr('class', `glyphicons ${loadingConfig[type].icon}`);
        $btnSurveyLink.find('span.text').text(loadingConfig[type].text);
        $btnSurveyLink.removeClass('disabled');
      } else {
        $btnSurveySpan.attr('class', 'glyphicons gly-spin glyphicons-refresh');
        $btnSurveyLink.find('span.text').text(loadingConfig[type].loadingText);
        $btnSurveyLink.addClass('disabled');
      }
    }
  }
});
