App.DeleteButtonComponent = Ember.Component.extend
  actions:
    confirm: ->
      el = this.get('element')
      $btn = $('.btn-delete', el)
      offset = $btn.offset()
      $confirm = $btn.next()
      height = $confirm.outerHeight()
      width = $confirm.outerWidth()
      # $confirm.css 'top', offset.top - height - 20
      # $confirm.css 'left', offset.left - (width/2) + 20
      $confirm.fadeIn()
    cancel: ->
      el = this.get('element')
      $confirm = $('.delete-confirm', el)
      $confirm.fadeOut()
    delete: ->
      el = this.get('element')  
      $confirm = $('.delete-confirm', el)
      $confirm.fadeOut()
      @sendAction()