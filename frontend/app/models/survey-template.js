import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

const {
  computed: { filterBy }
} = Ember;

export default Model.extend({
  // Attributes
  name: attr('string'),
  status: attr('string'),
  surveyType: attr('string'),
  fullyEditable: attr('boolean'),
  duplicatorLabel: attr('string'),

  // Relations
  questions: hasMany('question'),
  // Computed
  questionsNotNew: filterBy('questions', 'isNew', false),
  filteredquestions: filterBy('questionsNotNew', 'isDeleted', false)
});
