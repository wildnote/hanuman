Hanuman::Engine.routes.draw do

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
