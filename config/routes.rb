Hanuman::Engine.routes.draw do

  resources :observation_photos

  resources :rule_conditions

  resources :rules

  resources :conditions

  resources :settings

  namespace :api do
    namespace :v1 do
      resources :answer_choices
      resources :answer_types
      resources :questions do
        member do
          post :duplicate
        end
      end
      resources :survey_steps
      resources :rules
      resources :conditions
      resources :survey_templates do
        member do
          post :duplicate
        end
      end
    end
  end



  mount_ember_app :frontend, to: '/admin', controller: 'admin', action: 'index', as: 'admin'
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
      get :update_survey_data
    end
  end

  resources :observations

  resources :answer_choices

  resources :questions do
    collection do
      get 'import_answer_choices'
      post 'import'
    end
  end

  resources :answer_types

  get 'about' => 'about#index'

  #root 'about#index'
  mount_ember_assets :frontend, to: "/admin"

end
