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
  hiddendate: (->
    if @.get('name') == 'hiddendate'
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
})
