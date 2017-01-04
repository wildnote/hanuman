require 'paper_trail'
require 'amoeba'
require 'ancestry'
require 'ember-cli-rails'
require 'kaminari'
require 'active_model_serializers'
require 'roo'
require 'carrierwave'
require 'cloudinary'
require 'sidekiq'
require 'responders'

module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    config.generators.templates.unshift File.expand_path('lib/templates', root)

    config.generators do |g|
      g.test_framework      :rspec,        fixture: false
      g.fixture_replacement :factory_girl, dir: 'spec/factories'
      g.assets false
      g.helper false
    end

    config.to_prepare do
      Dir.glob(Rails.root + 'app/decorators/**/*_decorator*.rb').each do |c|
        require_dependency(c)
      end
    end

    initializer 'static assets' do |app|
      app.middleware.insert_before(::ActionDispatch::Static, ::ActionDispatch::Static, "#{root}/public")
    end
  end
end
