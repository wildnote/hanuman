App.Condition = DS.Model.extend({
  # question: DS.belongsTo('question')
  questionId: DS.attr('number')
  rule: DS.belongsTo('rule')
  operator: DS.attr('string')
  answer: DS.attr('string')
})
