module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    require 'rubygems'
    require 'haml-rails'
    require 'sass-rails'
    require 'coffee-rails'
    require 'uglifier'
    require 'bootstrap-generators'
    require 'twitter-typeahead-rails'
    require 'chosen-rails'

    config.generators.templates.unshift File.expand_path("lib/templates", root)
  end
end
