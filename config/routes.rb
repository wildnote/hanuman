Hanuman::Engine.routes.draw do
  get "home/index"
  root 'home#index'
  resources :organizations

end
