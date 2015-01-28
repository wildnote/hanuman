App.FormFieldComponent = Em.Component.extend
  hasError: (->
    @get('object.errors')?.has @get('for')
  ).property 'object.errors.[]'

  errors: (->
    return Em.A() unless @get('object.errors')
    @get('object.errors').errorsFor(@get('for')).mapBy('message').join(', ')
  ).property 'object.errors.[]'