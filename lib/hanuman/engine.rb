require 'paper_trail'
require 'amoeba'
require 'ancestry'
require 'handlebars_assets'
# require 'hamlbars'
require 'ember-rails'

module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    config.generators.templates.unshift File.expand_path("lib/templates", root)

    config.to_prepare do
      Dir.glob(Rails.root + "app/decorators/**/*_decorator*.rb").each do |c|
        require_dependency(c)
      end
    end
    
    initializer "hanuman.assets.precompile" do |app|
      app.config.assets.precompile += %w(hanuman.css hanuman.js)
    end
  end
end
