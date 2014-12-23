App.AnswerType = DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  questions: DS.hasMany('question', {async: true})
  # can't get the handlebars helper to work so doing in model
  nameUpcase: (->
    return @.get('name').toUpperCase()
  ).property('name')
  
  # computed properties for anwser type
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
  helper: (->
    if @.get('name') in ['helperabove', 'hiddenhelperabove', 'helperbelow', 'hiddenhelperbelow']
      return true
  ).property('name')
  line: (->
    if @.get('name') in ['line', 'hiddenline']
      return true
  ).property('name')
  radio: (->
    if @.get('name') in ['radio', 'hiddenradio']
      return true
  ).property('name')
  section: (->
    if @.get('name') in ['section', 'hiddenselect']
      return true
  ).property('name')
  select: (->
    if @.get('name') in ['select', 'hiddensection']
      return true
  ).property('name')
  static: (->
    if @.get('name') in ['static', 'hiddenstatic']
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
})
