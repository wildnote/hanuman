Hanuman::Engine.routes.draw do
  
  resources :surveys do
    member do
      patch :duplicate
    end
  end

  resources :survey_questions
  
  resources :observations

  resources :answer_choices

  resources :questions

  resources :answer_types

  resources :survey_templates

  resources :projects
  
  resources :organizations

  resources :survey_steps
  
  resources :survey_edit_steps
  
  get 'about' => 'about#index'
  
  #root 'about#index'
  
end
