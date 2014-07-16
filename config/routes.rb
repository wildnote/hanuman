Hanuman::Engine.routes.draw do
  
  get 'surveys/:id/edit/:group' => 'surveys#edit', as: :edit_survey
  
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
  
  resources :survey_steps
  
  get 'about' => 'about#index'
  
  #root 'about#index'
  
end
