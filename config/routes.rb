Hanuman::Engine.routes.draw do
  
  resources :surveys

  resources :survey_questions

  resources :answer_choices

  resources :questions

  resources :answer_types

  resources :survey_templates

  resources :projects
  
  resources :organizations

  resources :survey_steps
  
  get 'about' => 'about#index'
  
  #root 'about#index'
  
end
