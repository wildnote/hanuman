export default function() {
  this.transition(
    this.fromRoute('survey_templates.record'),
    this.toRoute('survey_templates.record.edit'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  this.transition(this.hasClass('show-answer-choices-liquid'), this.use('flyTo'));
}
