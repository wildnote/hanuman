App.AnswerType = DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  questions: DS.hasMany('question', {async: true})
  # can't get the handlebars helper to work so doing in model
  nameUpcase: (->
    return @.get('name').toUpperCase()
  ).property('name')

  # computed properties for anwser type
  checkbox: (->
    if @.get('name') in ['checkbox', 'hiddencheckbox']
      return true
    ).property('name')
  checkboxlist: (->
    if @.get('name') in ['checkboxlist', 'hiddencheckboxlist']
      return true
  ).property('name')
  chosenmultiselect: (->
    if @.get('name') in ['chosenmultiselect', 'hiddenchosenmultiselect']
      return true
  ).property('name')
  chosenmultiselectgrouped: (->
    if @.get('name') in ['chosenmultiselectgrouped', 'hiddenchosenmultiselectgrouped']
      return true
  ).property('name')
  email: (->
    if @.get('name') in ['email']
      return true
  ).property('name')
  helper: (->
    if @.get('name') in ['helperabove', 'hiddenhelperabove', 'helperbelow', 'hiddenhelperbelow']
      return true
  ).property('name')
  line: (->
    if @.get('name') in ['line', 'hiddenline']
      return true
  ).property('name')
  number: (->
    if @.get('name') in ['number', 'hiddennumber']
      return true
  ).property('name')
  password: (->
    if @.get('name') in ['password']
      return true
  ).property('name')
  radio: (->
    if @.get('name') in ['radio', 'hiddenradio']
      return true
  ).property('name')
  range: (->
    if @.get('name') in ['range']
      return true
  ).property('name')
  section: (->
    if @.get('name') in ['section', 'hiddensection']
      return true
  ).property('name')
  select: (->
    if @.get('name') in ['select', 'hiddenselect', 'chosenselect']
      return true
  ).property('name')
  static: (->
    if @.get('name') in ['static', 'hiddenstatic']
      return true
  ).property('name')
  tel: (->
    if @.get('name') in ['tel']
      return true
  ).property('name')
  text: (->
    if @.get('name') in ['text', 'hiddentext', 'date', 'hiddendate']
      return true
  ).property('name')
  textarea: (->
    if @.get('name') in ['textarea', 'hiddentextarea']
      return true
  ).property('name')
  time: (->
    if @.get('name') in ['time']
      return true
  ).property('name')
  typeahead: (->
    if @.get('name') in ['typeahead']
      return true
  ).property('name')

  hasAnswerChoices: (->
    if @.get('name') in ['checkboxlist', 'hiddencheckboxlist', 'chosenmultiselect',
      'hiddenchosenmultiselect', 'chosenmultiselectgrouped',
      'hiddenchosenmultiselectgrouped', 'radio', 'hiddenradio', 'select',
      'hiddenselect']
      return true
  ).property('name')
})
