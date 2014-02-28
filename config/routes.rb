Hanuman::Engine.routes.draw do
  resources :projects

  get "home/index"
  root 'home#index'
  resources :organizations

end
