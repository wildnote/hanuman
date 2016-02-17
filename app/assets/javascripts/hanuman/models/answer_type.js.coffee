App.AnswerType = DS.Model.extend({
  name: DS.attr('string')
  status: DS.attr('string')
  postName: DS.attr('string')
  postType: DS.attr('string')
  elementType: DS.attr('string')
  questions: DS.hasMany('question', {async: true})
  # can't get the handlebars helper to work so doing in model
  nameUpcase: (->
    return @.get('name').toUpperCase()
  ).property('name')

  hasAnswerChoices: (->
    if @.get('name') in ['checkboxlist', 'hiddencheckboxlist', 'chosenmultiselect',
      'hiddenchosenmultiselect', 'chosenmultiselectgrouped',
      'hiddenchosenmultiselectgrouped', 'radio', 'hiddenradio', 'select',
      'hiddenselect', 'chosenselect']
      return true
  ).property('name')
})
