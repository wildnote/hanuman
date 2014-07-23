module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    require 'rubygems'
    require 'paper_trail'
    require 'ancestry'
    require 'amoeba'
    require 'haml-rails'
    require 'sass-rails'
    require 'coffee-rails'
    require 'uglifier'
    require 'modernizr-rails'
    require 'jquery-rails'
    require 'handlebars_assets'
    require 'hamlbars'

    config.generators.templates.unshift File.expand_path("lib/templates", root)

    config.to_prepare do
      Dir.glob(Rails.root + "app/decorators/**/*_decorator*.rb").each do |c|
        require_dependency(c)
      end
    end
  end
end
