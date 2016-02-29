App.Rule = DS.Model.extend({
  question: DS.belongsTo('question')
  matchType: DS.attr('string')
  condtions: DS.hasMany('conditions')
})
