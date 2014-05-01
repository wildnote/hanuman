module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    require 'rubygems'
    require 'ancestry'
    require 'wicked'
    require 'amoeba'
    require 'haml-rails'
    require 'sass-rails'
    require 'coffee-rails'
    require 'uglifier'
    require 'modernizr-rails'
    require 'jquery-rails'
    require 'handlebars_assets'

    config.generators.templates.unshift File.expand_path("lib/templates", root)
  end
end
