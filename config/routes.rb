Hanuman::Engine.routes.draw do
  resources :answer_choices

  resources :questions

  resources :answer_types

  resources :survey_templates

  resources :projects

  get "home/index"
  root 'home#index'
  resources :organizations

end
