Hanuman::Engine.routes.draw do
  resources :survey_templates

  resources :projects

  get "home/index"
  root 'home#index'
  resources :organizations

end
