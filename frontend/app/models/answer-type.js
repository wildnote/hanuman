import { computed } from '@ember/object';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  name: attr('string'),
  status: attr('string'),
  postName: attr('string'),
  postType: attr('string'),
  elementType: attr('string'),
  groupType: attr('string'),
  descriptiveName: attr('string'),
  description: attr('string'),
  hasAnAnswer: attr('boolean', { defaultValue: false }),

  types: [
    'checkboxlist',
    'hiddencheckboxlist',
    'chosenmultiselect',
    'hiddenchosenmultiselect',
    'chosenmultiselectgrouped',
    'hiddenchosenmultiselectgrouped',
    'radio',
    'hiddenradio',
    'select',
    'hiddenselect',
    'chosenselect'
  ],

  // Associations
  questions: hasMany('question'),

  // Computed Properties
  hasAnswerChoices: computed('name', function() {
    return this.get('types').includes(this.get('name'));
  }),

  isNotLookupRule: computed('name', function() {
    return ['chosenselect', 'chosenmultiselect', 'document', 'helperabove', 'photo', 'video', 'line', 'repeater', 'section', 'latlong', 'signature', 'static'].includes(this.get('name'));
  }),

  // isNotLookupCondition: computed('name', function() {
  //   return ['time'].includes(this.get('name'));
  // }),

  displayName: computed('name', 'descriptiveName', function() {
    return this.get('descriptiveName') || this.get('name');
  })

});
