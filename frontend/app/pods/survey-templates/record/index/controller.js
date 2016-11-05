import Ember from 'ember';
const {
  $,
  computed: { alias }
} = Ember;

export default Ember.Controller.extend({
  surveyTemplate: alias('model'),
  actions:{
    toggleDuplicateLoading(){
      let $duplicateSurveyLink = $('#duplicate-survey-link'),
          $duplicateSurveySpan = $('#duplicate-survey-link span.glyphicons');
      if($duplicateSurveyLink.hasClass('disabled')){
        $duplicateSurveySpan.attr('class','glyphicons glyphicons-more-items');
        $duplicateSurveyLink.find('span.text').text('Duplicate Survey Template');
        $duplicateSurveyLink.removeClass('disabled');
      }else{
        $duplicateSurveySpan.attr('class','glyphicons gly-spin glyphicons-refresh');
        $duplicateSurveyLink.find('span.text').text('Duplicating...');
        $duplicateSurveyLink.addClass('disabled');
      }
    }
  }
});

