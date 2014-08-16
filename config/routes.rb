Hanuman::Engine.routes.draw do

  namespace :api do
    namespace :v1 do
      resources :answer_choices
      resources :answer_types
      resources :questions
      resources :survey_questions
      resources :survey_templates
    end
  end

  get 'admin' => 'admin#index'
  get 'admin/show'

  get 'surveys/:id/edit/:step/:entry' => 'surveys#edit', as: :edit_survey

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

  get 'about' => 'about#index'

  #root 'about#index'

end
