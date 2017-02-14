require 'rails/generators/base'
module Hanuman
  class FrontendGenerator < Rails::Generators::Base
    source_root File.expand_path("../../../../", __FILE__)
    def copy_frontend_folder
      directory 'frontend', 'frontend', {exclude_pattern: /bower_components|node_modules|tmp|testem.log/}
    end
  end
end