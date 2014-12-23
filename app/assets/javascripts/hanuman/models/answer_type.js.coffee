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
    if @.get('name') == 'checkboxlist'
      return true
  ).property('name')
  chosenmultiselect: (->
    if @.get('name') == 'chosenmultiselect'
      return true
  ).property('name')
  chosenmultiselectgrouped: (->
    if @.get('name') == 'chosenmultiselectgrouped'
      return true
  ).property('name')
  date: (->
    if @.get('name') == 'date'
      return true
  ).property('name')
  helperabove: (->
    if @.get('name') == 'helperabove'
      return true
  ).property('name')
  helperbelow: (->
    if @.get('name') == 'helperbelow'
      return true
  ).property('name')
  line: (->
    if @.get('name') == 'line'
      return true
  ).property('name')
  radio: (->
    if @.get('name') == 'radio'
      return true
  ).property('name')
  section: (->
    if @.get('name') == 'section'
      return true
  ).property('name')
  select: (->
    if @.get('name') == 'select'
      return true
  ).property('name')
  static: (->
    if @.get('name') == 'static'
      return true
  ).property('name')
  text: (->
    if @.get('name') == 'text'
      return true
  ).property('name')
  textarea: (->
    if @.get('name') == 'textarea'
      return true
  ).property('name')
  hiddendate: (->
    if @.get('name') == 'hiddendate'
      return true
  ).property('name')
  hiddensection: (->
    if @.get('name') == 'hiddensection'
      return true
  ).property('name')
  hiddenstatic: (->
    if @.get('name') == 'hiddenstatic'
      return true
  ).property('name')
  hiddenline: (->
    if @.get('name') == 'hiddenline'
      return true
  ).property('name')
  hiddenhelperabove: (->
    if @.get('name') == 'hiddenhelperabove'
      return true
  ).property('name')
  hiddenhelperbelow: (->
    if @.get('name') == 'hiddenhelperbelow'
      return true
  ).property('name')
  hiddencheckboxlist: (->
    if @.get('name') == 'hiddencheckboxlist'
      return true
  ).property('name')
  hiddenchosenmultiselect: (->
    if @.get('name') == 'hiddenchosenmultiselect'
      return true
  ).property('name')
  hiddenchosenmultiselectgrouped: (->
    if @.get('name') == 'hiddenchosenmultiselectgrouped'
      return true
  ).property('name')
  hiddenradio: (->
    if @.get('name') == 'hiddenradio'
      return true
  ).property('name')
  hiddenselect: (->
    if @.get('name') == 'hiddenselect'
      return true
  ).property('name')
  hiddentext: (->
    if @.get('name') == 'hiddentext'
      return true
  ).property('name')
  hiddentextarea: (->
    if @.get('name') == 'hiddentextarea'
      return true
  ).property('name')
})
