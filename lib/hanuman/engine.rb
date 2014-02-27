module Hanuman
  class Engine < ::Rails::Engine
    isolate_namespace Hanuman

    require 'haml-rails'
    require 'sass-rails'
    require 'coffee-rails'
    require 'uglifier'
    require 'bootstrap-generators'

    config.generators.templates.unshift File.expand_path("lib/templates", root)
  end
end
