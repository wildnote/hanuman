Hanuman::Engine.routes.draw do

  resources :survey_steps

  resources :settings

  namespace :api do
    namespace :v1 do
      resources :answer_choices
      resources :answer_types
      resources :questions
      resources :survey_steps
      resources :survey_templates
      resources :surveys
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

  resources :survey_templates do
    member do
      patch :duplicate
    end
  end

  resources :observations

  resources :answer_choices

  resources :questions

  resources :answer_types

  get 'about' => 'about#index'

  #root 'about#index'

end
