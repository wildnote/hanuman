App.Condition = DS.Model.extend({
  question: DS.belongsTo('question')
  rule: DS.belongsTo('rule')
  operator: DS.attr('string')
  answer: DS.attr('string')
})
