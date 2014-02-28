Hanuman::Engine.routes.draw do
  resources :questions

  resources :answer_types

  resources :survey_templates

  resources :projects

  get "home/index"
  root 'home#index'
  resources :organizations

end
